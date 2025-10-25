import { ROLES } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { getProductUinqueSlug } from "helpers/slug";
import { Amenity } from "models/amenity.model";
import { Property, IProperty } from "models/property.model";
import mongoose, { PipelineStage } from "mongoose";
import { findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import moment from "moment";
import { SendBrevoMail } from "services/brevoMail.service";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";
import { Order } from "models/order.model";
import { User } from "models/user.model";
import generateHTML from "helpers/generateHTML";

export const creatProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      title,
      mainImage,
      rooms,
      galleries,
      amenities,
      pdf,
      mealImage,
      nonVegMenuImage,
      mixMenuImage,
      guestPriceArr,
      sellerId,
      destinationId,
      address,
      description,
      serviceType,
      allamenities,
      collections,
      area,
      bathroom,
      bedroom,
      guest,
      maxGuest,
      viewMore,
      meals,
      support,
      price,
      map,
      faqs,
      propertyRules,
      todos,
      Infromation,
      group,
      discountValue,
    } = req.body;

    console.log(JSON.stringify(req.body, null, 2), "req.body in create property");

    // ========== VALIDATION LOGIC ==========

    // 1. Required String Fields (must not be empty)
    const requiredStringFields = {
      name: name,
      title: title,
      address: address,
      description: description,
      serviceType: serviceType,
      viewMore: viewMore,
      support: support,
      map: map,
      propertyRules: propertyRules,
    };

    for (const [fieldName, value] of Object.entries(requiredStringFields)) {
      if (!value || typeof value !== "string" || value.trim() === "") {
        throw new Error(`${fieldName} is required and cannot be empty`);
      }
    }

    // 2. Required Number Fields (must be valid numbers > 0)
    const requiredNumberFields = {
      bathroom: bathroom,
      bedroom: bedroom,
      guest: guest,
      price: price,
      discountValue: discountValue,
    };

    for (const [fieldName, value] of Object.entries(requiredNumberFields)) {
      if (value === undefined || value === null || typeof value !== "number" || value < 0) {
        throw new Error(`${fieldName} must be a valid number >= 0`);
      }
    }

    // 3. Required ObjectId Fields
    if (!sellerId) {
      throw new Error("Owner Required");
    }
    if (!destinationId) {
      throw new Error("location Required");
    }

    // 4. Required Array Fields
    const requiredArrayFields = {
      allamenities: allamenities,
      collections: collections,
      galleries: galleries,
      rooms: rooms,
      meals: meals,
      faqs: faqs,
      amenities: amenities,
    };

    for (const [fieldName, value] of Object.entries(requiredArrayFields)) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${fieldName} required`); // Adjusted error message
      }
    }

    // 5. Validate specific array structures

    // Validate allamenities structure
    if (allamenities.length === 0) {
      throw new Error(
        "amentities are mandetory, Please select at least one amenity from the list or contact admin to add new amenities",
      );
    }

    // Validate galleries structure
    if (galleries.some((gallery: any) => !Array.isArray(gallery.imageList))) {
      throw new Error("All property images must have a name");
    }

    // Validate rooms structure (description is optional as per your requirement)
    if (rooms.some((room: any) => !room.title || !room.image)) {
      throw new Error("All rooms must have title and image");
    }

    // Validate meals structure
    // if (meals.some((meal: any) => !meal.name || !Array.isArray(meal.priceArr))) {
    //   throw new Error("All meals must have name and priceArr array");
    // }

    // Validate faqs structure
    if (faqs.some((faq: any) => !faq.question || !faq.answer)) {
      throw new Error("All FAQs must have question and answer");
    }

    // Validate amenities structure

    // 6. Conditional validation for guestPriceArr (only validate when maxGuest exists)
    if (maxGuest && maxGuest > 0) {
      if (!Array.isArray(guestPriceArr) || guestPriceArr.length === 0) {
        throw new Error("guestPriceArr is required when maxGuest is provided");
      }
      if (guestPriceArr.some((item: any) => typeof item.price !== "number" || item.price < 0)) {
        throw new Error("All items in guestPriceArr must have valid price >= 0");
      }
    }

    // 7. Validate support phone number format
    if (!/^\d{10}$/.test(support.replace(/\D/g, ""))) {
      throw new Error("Support must be a valid 10-digit phone number");
    }

    // 8. Validate image fields if provided
    const imageFields = { mainImage, mealImage, nonVegMenuImage, mixMenuImage };
    for (const [fieldName, imageValue] of Object.entries(imageFields)) {
      if (imageValue && typeof imageValue !== "string") {
        throw new Error(`${fieldName} must be a string if provided`);
      }
    }

    // ========== END VALIDATION ==========

    // Check for existing property
    await throwIfExist<IProperty>(
      Property,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.PROPERTY.EXIST,
    );

    const newPropertyObj = {
      ...req.body,
      sellerId: newObjectId(sellerId),
      destinationId: newObjectId(destinationId),
      slug: await getProductUinqueSlug(name),
    };

    let validCollections: any = [];
    console.log("render0");
    console.log(req.body?.collections, "req.body?.collections");

    if (req.body?.collections && req.body?.collections.length > 0) {
      for (const collection of req.body.collections) {
        if (typeof collection === "string" && collection.trim() !== "") {
          validCollections.push(newObjectId(collection));
        }
      }
      console.log(validCollections, "collections");
    }

    if (validCollections && validCollections?.length > 0) {
      newPropertyObj["collections"] = validCollections;
    }

    if (mainImage && mainImage.includes("base64")) {
      newPropertyObj["mainImage"] = await storeFileAndReturnNameBase64(mainImage);
    }
    console.log("render1");

    if (pdf && pdf.includes("base64")) {
      newPropertyObj["pdf"] = await storeFileAndReturnNameBase64(pdf);
    }
    console.log("render2");

    if (mealImage && mealImage.includes("base64")) {
      newPropertyObj["mealImage"] = await storeFileAndReturnNameBase64(mealImage);
    }
    console.log("render3");

    if (mixMenuImage && mixMenuImage.includes("base64")) {
      newPropertyObj["mixMenuImage"] = await storeFileAndReturnNameBase64(mixMenuImage);
    }
    console.log("render4");

    if (nonVegMenuImage && nonVegMenuImage.includes("base64")) {
      newPropertyObj["nonVegMenuImage"] = await storeFileAndReturnNameBase64(nonVegMenuImage);
    }

    let tempRoom: any = rooms;
    if (tempRoom && tempRoom?.length > 0) {
      for (const room of tempRoom) {
        if (room.image && room.image.includes("base64")) {
          let image = await storeFileAndReturnNameBase64(room.image, room.title.replace(" ", "").toLowerCase());
          if (image) {
            room.image = image;
          }
        }
      }
      newPropertyObj["rooms"] = tempRoom;
    }

    let tempguestPriceArr: any = guestPriceArr;
    if (tempguestPriceArr && tempguestPriceArr?.length > 0) {
      let key = 0;
      for (const guest of tempguestPriceArr) {
        guest["guest"] = guest + key + 1;
        key++;
      }
    }
    newPropertyObj["guestPriceArr"] = tempguestPriceArr;

    let tempAmenity: any = [];
    if (amenities && amenities?.length > 0) {
      for (const amenity of amenities) {
        if (amenity) {
          if (amenity.amenityId && typeof amenity.amenityId == "string") {
            let amenityObj = await Amenity.findById(newObjectId(amenity.amenityId));
            if (amenityObj) {
              let amentiy = {
                amenityCategoryName: amenityObj?.amenityCategoryName,
                amenityCategoryId: amenityObj?.amenityCategoryId,
                name: amenityObj?.name,
                amenityId: amenityObj?._id,
              };
              tempAmenity.push(amentiy);
            }
          }
        }
      }
      newPropertyObj["amenities"] = tempAmenity;
    }

    console.log(JSON.stringify(newPropertyObj["amenities"], null, 2), "amenities--");

    let tempGalleries: any = galleries;
    if (galleries && galleries?.length > 0) {
      for (const gallery of galleries) {
        if (gallery && gallery?.imageList?.length > 0) {
          let images: any = gallery?.imageList;
          let k = 0;
          for (let element of images) {
            if (element && element?.dataURL && element?.dataURL.includes("base64")) {
              let image = await storeFileAndReturnNameBase64(
                element?.dataURL,
                gallery.name.replace(" ", "").toLowerCase() + k,
              );
              if (image) {
                images[k] = image;
              }
              k++;
            }
          }
          gallery.imageList = images;
        }
      }
      newPropertyObj["galleries"] = galleries;
    }

    const newProperty = new Property(newPropertyObj);
    const savedProperty = await newProperty.save();

    res.status(201).json({
      message: MESSAGE.PROPERTY.CREATED,
      data: {
        _id: savedProperty?._id,
      },
    });
  } catch (error) {
    console.log("ERROR IN PROPERTY CONTROLLER:", error);
    next(error);
  }
};

export const getProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }
    if (req.query.destinationId && req.query.destinationId != "") {
      matchObj.destinationId = new mongoose.Types.ObjectId(req.query.destinationId as string);
    }

    if (req.query.query && req.query.query != "") {
      matchObj.name = new RegExp(String(req.query.query), "i");
    }

    if (req.user) {
      let user = req.user;
      let role = user.role;
      if (role == ROLES.SELLER) {
        matchObj.sellerId = newObjectId(user.userId);
      }
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: matchObj,
      },
    ];

    if (req.query.ForSelect) {
      pipeline = [
        {
          $match: matchObj,
        },
        {
          $project: {
            _id: 0,
            label: "$name",
            value: "$_id",
          },
        },
      ];
    }
    const PropertyArr = await paginateAggregate(Property, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PROPERTY.ALLPROPERTY, data: PropertyArr.data, total: PropertyArr.total });
  } catch (error) {
    console.log("ERROR IN PROPERTY CONTROLLER");
    next(error);
  }
};

export const getPropertyWebsite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { status: "APPROVED", isDeleted: false };
    let sortObj: Record<string, any> = {};
    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }
    if (req.query.room && req.query.room != "") {
      matchObj.bedroom = { $gte: Number(req.query.room) };
    }
    let date = new Date();
    // Set startDate to today at 00:00:00 and endDate to today at 23:59:59
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (req.query.query && req.query.query != "") {
      matchObj.$or = [
        // { name: new RegExp(`${req.query.query}`, "i") },
        { "destination.name": new RegExp(`${req.query.query}`, "i") },
      ];
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.status) {
      matchObj.status = req.query.status;
    }

    if (req.query.top) {
      matchObj.top = req.query.top;
    }
    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.min) {
      matchObj["price"] = {
        $gte: Number(req.query.min),
      };
    }

    if (req.query.max) {
      if (matchObj["price"]) {
        matchObj["price"] = {
          ...matchObj["price"],
          $lte: Number(req.query.max),
        };
      } else {
        matchObj["price"] = {
          $lte: Number(req.query.max),
        };
      }
    }

    if (req.query.destinationId) {
      matchObj.destinationId = newObjectId(req.query.destinationId);
    }

    if (req.query.collection && req.query.collection != "") {
      let collection = String(req.query.collection);
      let collectionArr = collection.split(",");
      matchObj["collections.collectionId"] = { $in: [...collectionArr.map((el) => el && newObjectId(el))] };
    }
    if (req.query.location && req.query.location != "") {
      let location = String(req.query.location);
      let locationArr = location.split(",");
      matchObj["destinationId"] = { $in: [...locationArr.map((el) => el && newObjectId(el))] };
    }

    if (req.query.group) {
      matchObj.group = req.query.group;
    }
    let pipeline: PipelineStage[] = [
      {
        $unwind: {
          path: "$amenities",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "destinations",
          localField: "destinationId",
          foreignField: "_id",
          as: "destination",
        },
      },
      {
        $unwind: {
          path: "$destination",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchObj,
      },

      {
        $lookup: {
          from: "amenitys",
          localField: "amenities.amenityId",
          foreignField: "_id",
          as: "amenityDetails",
        },
      },
      {
        $unwind: {
          path: "$amenityDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "propertyId",
          as: "wishlistsObj",
        },
      },
      {
        $addFields: {
          isWishlist: {
            $in: [
              req?.query?.userId ? new mongoose.Types.ObjectId(String(req.query.userId)) : null,
              "$wishlistsObj.userId",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "rates",
          localField: "_id",
          foreignField: "propertyId",
          as: "rateObj",
        },
      },
      {
        $addFields: {
          dayPrice: {
            $map: {
              input: {
                $filter: {
                  input: "$rateObj",
                  as: "item",
                  cond: {
                    $and: [
                      {
                        $gte: ["$$item.date", startDate],
                      },
                      {
                        $lte: ["$$item.date", endDate],
                      },
                    ],
                  },
                },
              },
              as: "item",
              in: "$$item.price",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$dayPrice",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "propertyId",
          pipeline: [
            {
              $match: {
                isDeleted: false,
                status: "active",
              },
            },
          ],
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
          preserveNullAndEmptyArrays: true, // Keep documents even if result array is empty
        },
      },
      {
        $addFields: {
          allImages: {
            $concatArrays: [
              // Add mainImage as the first element (if it exists)
              {
                $cond: [{ $ifNull: ["$mainImage", false] }, ["$mainImage"], []],
              },
              // Then add all images from galleries
              {
                $reduce: {
                  input: "$galleries",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.imageList"] },
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          serviceType: { $first: "$serviceType" },
          allImages: { $first: "$allImages" },
          // Push all gallery images and mainImage into allImages array
          mainImage: { $first: "$mainImage" },
          name: { $first: "$name" },
          title: { $first: "$title" },
          dayPrice: { $first: "$dayPrice" },
          slug: { $first: "$slug" },
          isWishlist: { $first: "$isWishlist" },
          price: { $first: "$price" },
          maxStar: { $max: "$result.star" },
          bedroom: { $first: "$bedroom" },
          bathroom: { $first: "$bathroom" },
          guest: { $first: "$guest" },
          createdAt: { $first: "$createdAt" },
          destination: { $first: "$destination.name" },
          location: { $first: "$destination.name" },
          wishlistsObj: { $first: "$wishlistsObj" },
          amenities: {
            $push: {
              name: "$amenities.name",
              amenityId: "$amenities.amenityId",
              thumbnail: "$amenityDetails.thumbnail",
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          serviceType: 1,
          allImages: 1,
          title: 1,
          slug: 1,
          price: 1,
          dayPrice: 1,
          isWishlist: 1,
          maxStar: 1,
          mainImage: 1,
          bedroom: 1,
          bathroom: 1,
          guest: 1,
          createdAt: 1,
          destination: 1,
          wishlistsObj: 1,
          amenities: {
            $slice: ["$amenities", 3],
          },
        },
      },
    ];

    if (req.query.query && req.query.query != "") {
      pipeline.push({
        $group: {
          _id: "$destination",
        },
      });
    }

    if (req.query.sort == "high") {
      sortObj = {
        price: -1,
      };
    } else if (req.query.sort == "low") {
      sortObj = {
        price: 1,
      };
    } else if (req.query.sort == "oldest") {
      sortObj = {
        createdAt: 1,
      };
    } else if (req.query.sort == "latest") {
      sortObj = {
        createdAt: -1,
      };
    } else {
      sortObj = {
        price: -1,
      };
    }

    pipeline.push({
      $sort: sortObj,
    });

    const PropertyArr = await paginateAggregate(Property, pipeline, req.query);
    console.log(JSON.stringify(pipeline, null, 2), "pipeline");
    res.status(200).json({ message: MESSAGE.PROPERTY.ALLPROPERTY, data: PropertyArr.data, total: PropertyArr.total });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let PropertyObj: any = await throwIfNotExist(
      Property,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.PROPERTY.NOT_FOUND,
    );

    let pipeline: any = [
      {
        $match: {
          _id: newObjectId(req.params.id),
        },
      },
    ];

    if (req.query?.update) {
      pipeline = [
        ...pipeline,
        ...[
          {
            $lookup: {
              from: "destinations",
              localField: "destinationId",
              foreignField: "_id",
              as: "destination",
            },
          },
          {
            $unwind: {
              path: "$destination",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $lookup: {
              from: "users",
              localField: "sellerId",
              foreignField: "_id",
              as: "seller",
            },
          },
          {
            $unwind: {
              path: "$seller",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      ];
    } else {
      pipeline = [
        ...pipeline,
        ...[
          {
            $lookup: {
              from: "destinations",
              localField: "destinationId",
              foreignField: "_id",
              as: "destination",
            },
          },
          {
            $unwind: {
              path: "$destination",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$amenities",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "amenitys",
              localField: "amenities.amenityId",
              foreignField: "_id",
              as: "amenityDetails",
            },
          },
          {
            $unwind: {
              path: "$amenityDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "wishlists",
              localField: "_id",
              foreignField: "propertyId",
              as: "wishlistsObj",
            },
          },
          {
            $unwind: {
              path: "$wishlistsObj",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "reels",
              localField: "_id",
              foreignField: "propertyId",
              as: "reels",
            },
          },
          {
            $group: {
              _id: "$_id",
              sellerId: {
                $first: "$sellerId",
              },
              reels: { $first: "$reels" },
              mixMenuImage: { $first: "$mixMenuImage" },
              Infromation: { $first: "$Infromation" },
              name: {
                $first: "$name",
              },
              title: {
                $first: "$title",
              },
              slug: {
                $first: "$slug",
              },
              mainImage: {
                $first: "$mainImage",
              },
              bedroom: {
                $first: "$bedroom",
              },
              bathroom: {
                $first: "$bathroom",
              },
              guest: {
                $first: "$guest",
              },
              description: {
                $first: "$description",
              },
              destination: {
                $first: "$destination",
              },
              location: {
                $first: "$destination.name",
              },
              area: {
                $first: "$area",
              },
              address: {
                $first: "$address",
              },
              mealImage: {
                $first: "$mealImage",
              },
              nonVegMenuImage: {
                $first: "$nonVegMenuImage",
              },
              meals: {
                $first: "$meals",
              },
              map: {
                $first: "$map",
              },
              todos: {
                $first: "$todos",
              },
              price: {
                $first: "$price",
              },
              galleries: {
                $first: "$galleries",
              },
              rooms: {
                $first: "$rooms",
              },
              propertyRules: {
                $first: "$propertyRules",
              },
              faqs: {
                $first: "$faqs",
              },
              viewMore: {
                $first: "$viewMore",
              },
              wishlistsObj: {
                $first: "$wishlistsObj",
              },
              amenities: {
                $push: {
                  name: "$amenities.name",
                  amenityCategoryName: "$amenities.amenityCategoryName",
                  amenityId: "$amenities.amenityId",
                  thumbnail: "$amenityDetails.thumbnail",
                },
              },
            },
          },
        ],
      ];
    }

    let PropertyPropetLine = await Property.aggregate(pipeline);
    if (PropertyPropetLine && PropertyPropetLine?.length > 0) {
      PropertyObj = PropertyPropetLine[0];
    }
    res.status(200).json({ message: MESSAGE.PROPERTY.GOTBYID, data: PropertyObj });
  } catch (error) {
    console.log("ERROR IN PROPERTY CONTROLLER");
    next(error);
  }
};

export const getPropertyBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let PropertyObj: any = await throwIfNotExist(
      Property,
      { slug: req.params.slug, isDeleted: false },
      ERROR.PROPERTY.NOT_FOUND,
    );
    let pipeline = [
      {
        $match: {
          slug: req.params.slug,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "destinations",
          localField: "destinationId",
          foreignField: "_id",
          as: "destination",
        },
      },
      {
        $unwind: {
          path: "$destination",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "propertyId",
          as: "wishlistsObj",
        },
      },
      {
        $addFields: {
          isWishlist: {
            $in: [
              req?.query?.userId ? new mongoose.Types.ObjectId(String(req.query.userId ?? "")) : "",
              "$wishlistsObj.userId",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "propertyId",
          as: "reviews",
        },
      },
      {
        $lookup: {
          from: "collections",
          localField: "collections",
          foreignField: "_id",
          as: "collectionsDetails",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "propertyId",
          pipeline: [
            {
              $match: {
                isDeleted: false,
                status: "active",
              },
            },
          ],
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "amenitys",
          let: {
            propertyAmenities: "$amenities",
            propertyId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", { $ifNull: ["$$propertyAmenities.amenityId", []] }] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "amenitycategorys",
                let: { amenityCategoryId: "$amenityCategoryId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$amenityCategoryId"] }, { $eq: ["$isDeleted", false] }],
                      },
                    },
                  },
                ],
                as: "categoryDetails",
              },
            },
            {
              $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $project: {
                name: 1,
                amenityCategoryName: "$categoryDetails.name",
                amenityId: "$_id",
                thumbnail: 1,
              },
            },
          ],
          as: "processedAmenities",
        },
      },
      {
        $lookup: {
          from: "reels",
          localField: "_id",
          foreignField: "propertyId",
          as: "reels",
        },
      },
      {
        $group: {
          _id: "$_id",
          sellerId: { $first: "$sellerId" },
          collectionsDetails: { $first: "$collectionsDetails" },
          support: { $first: "$support" },
          name: { $first: "$name" },
          maxStar: { $max: "$result.star" },
          mixMenuImage: { $first: "$mixMenuImage" },
          isWishlist: { $first: "$isWishlist" },
          pdf: { $first: "$pdf" },
          title: { $first: "$title" },
          slug: { $first: "$slug" },
          mainImage: { $first: "$mainImage" },
          bedroom: { $first: "$bedroom" },
          reels: { $first: "$reels" },
          bathroom: { $first: "$bathroom" },
          guest: { $first: "$guest" },
          description: { $first: "$description" },
          destination: { $first: "$destination" },
          viewMore: { $first: "$viewMore" },
          location: { $first: "$destination.name" },
          area: { $first: "$area" },
          address: { $first: "$address" },
          mealImage: { $first: "$mealImage" },
          nonVegMenuImage: { $first: "$nonVegMenuImage" },
          meals: { $first: "$meals" },
          map: { $first: "$map" },
          todos: { $first: "$todos" },
          price: { $first: "$price" },
          galleries: { $first: "$galleries" },
          rooms: { $first: "$rooms" },
          propertyRules: { $first: "$propertyRules" },
          faqs: { $first: "$faqs" },
          wishlistsObj: { $first: "$wishlistsObj" },
          amenities: { $first: "$processedAmenities" },
        },
      },
      {
        $project: {
          sellerId: 1,
          collectionsDetails: 1,
          support: 1,
          reels: 1,
          name: 1,
          maxStar: 1,
          mixMenuImage: 1,
          isWishlist: 1,
          pdf: 1,
          title: 1,
          slug: 1,
          mainImage: 1,
          bedroom: 1,
          bathroom: 1,
          guest: 1,
          description: 1,
          destination: 1,
          viewMore: 1,
          location: 1,
          area: 1,
          address: 1,
          mealImage: 1,
          nonVegMenuImage: 1,
          meals: 1,
          map: 1,
          todos: 1,
          price: 1,
          galleries: 1,
          rooms: 1,
          propertyRules: 1,
          faqs: 1,
          wishlistsObj: 1,
          amenities: 1,
        },
      },
    ];

    let PropertyPropetLine = await Property.aggregate(pipeline);
    if (PropertyPropetLine && PropertyPropetLine?.length > 0) {
      PropertyObj = PropertyPropetLine[0];
    }
    res.status(200).json({ message: MESSAGE.PROPERTY.GOTBYID, data: PropertyObj });
  } catch (error) {
    console.log("ERROR IN PROPERTY CONTROLLER");
    next(error);
  }
};

export const updatProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {
      name,
      title,
      address,
      description,
      serviceType,
      allamenities,
      collections,
      guestPriceArr,
      bathroom,
      bedroom,
      guest,
      maxGuest,
      viewMore,
      meals,
      support,
      price,
      map,
      faqs,
      propertyRules,
      mainImage,
      mixMenuImage,
      pdf,
      rooms,
      nonVegMenuImage,
      mealImage,
      galleries,
      amenities,
      sellerId,
      destinationId,
    } = req.body;

    // ========== VALIDATION LOGIC ==========

    // 1. Validate String Fields (if provided, must not be empty)
    const stringFields = {
      name,
      title,
      address,
      description,
      serviceType,
      viewMore,
      support,
      map,
      propertyRules,
    };

    for (const [fieldName, value] of Object.entries(stringFields)) {
      if (value !== undefined && value !== null) {
        if (typeof value !== "string" || value.trim() === "") {
          throw new Error(`${fieldName} cannot be empty if provided`);
        }
      }
    }

    // 2. Validate Number Fields (if provided, must be valid numbers >= 0)
    const numberFields = {
      bathroom,
      bedroom,
      guest,
      price,
    };

    for (const [fieldName, value] of Object.entries(numberFields)) {
      if (value !== undefined && value !== null) {
        if (typeof value !== "number" || value < 0) {
          throw new Error(`${fieldName} must be a valid number >= 0 if provided`);
        }
      }
    }

    // 3. Validate ObjectId Fields (if provided)
    if (sellerId !== undefined && !mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new Error("Invalid sellerId");
    }
    if (destinationId !== undefined && !mongoose.Types.ObjectId.isValid(destinationId)) {
      throw new Error("Invalid destinationId");
    }

    // 4. Validate Array Fields (if provided, must be non-empty arrays)
    const arrayFields = {
      allamenities,
      collections,
      galleries,
      rooms,
      meals,
      faqs,
      amenities,
    };

    for (const [fieldName, value] of Object.entries(arrayFields)) {
      if (value !== undefined && value !== null) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error(`${fieldName} must be a non-empty array if provided`);
        }
      }
    }

    // 5. Validate specific array structures (if provided)

    // Validate allamenities structure
    if (
      allamenities &&
      allamenities.some(
        (item: any) => !item.amenityCategoryName || !item.amenityCategoryId || !item.name || !item.amenityId,
      )
    ) {
      throw new Error(
        "All items in allamenities must have amenityCategoryName, amenityCategoryId, name, and amenityId",
      );
    }

    // Validate collections (must be valid ObjectIds)
    if (collections && collections.some((id: string) => !mongoose.Types.ObjectId.isValid(id))) {
      throw new Error("All collection IDs must be valid ObjectIds");
    }

    // Validate galleries structure
    if (galleries && galleries.some((gallery: any) => !Array.isArray(gallery.imageList))) {
      throw new Error("All galleries must have a name and imageList array");
    }

    // Validate rooms structure (description is optional)
    if (rooms && rooms.some((room: any) => !room.title || !room.image)) {
      throw new Error("All rooms must have title and image");
    }

    // Validate meals structure
    // if (meals && meals.some((meal: any) => !meal.name || !Array.isArray(meal.priceArr))) {
    //   throw new Error("All meals must have name and priceArr array");
    // }

    // Validate faqs structure
    if (faqs && faqs.some((faq: any) => !faq.question || !faq.answer)) {
      throw new Error("All FAQs must have question and answer");
    }

    // Validate amenities structure
    if (
      amenities &&
      amenities.some(
        (item: any) => !item.amenityCategoryName || !item.amenityCategoryId || !item.name || !item.amenityId,
      )
    ) {
      throw new Error("All items in amenities must have amenityCategoryName, amenityCategoryId, name, and amenityId");
    }

    // 6. Conditional validation for guestPriceArr (only validate when maxGuest exists)
    if (maxGuest && maxGuest > 0 && guestPriceArr) {
      if (!Array.isArray(guestPriceArr) || guestPriceArr.length === 0) {
        throw new Error("guestPriceArr is required when maxGuest is provided");
      }
      if (guestPriceArr.some((item: any) => typeof item.price !== "number" || item.price < 0)) {
        throw new Error("All items in guestPriceArr must have valid price >= 0");
      }
    }

    // 7. Validate support phone number format (if provided)
    if (support && !/^\d{10}$/.test(support.replace(/\D/g, ""))) {
      throw new Error("Support must be a valid 10-digit phone number");
    }

    // 8. Validate image fields if provided
    const imageFields = { mainImage, mealImage, nonVegMenuImage, mixMenuImage };
    for (const [fieldName, imageValue] of Object.entries(imageFields)) {
      if (imageValue !== undefined && imageValue !== null && typeof imageValue !== "string") {
        throw new Error(`${fieldName} must be a string if provided`);
      }
    }

    // ========== END VALIDATION ==========

    let PropertyObj: any = await throwIfNotExist(
      Property,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.PROPERTY.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Property,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.PROPERTY.EXIST,
      );
    }

    let validCollections: any = [];
    console.log(req.body, "req.body?.collections");

    if (req.body?.collections && req.body?.collections.length > 0) {
      for (const collection of req.body.collections) {
        if (typeof collection === "string" && collection.trim() !== "") {
          validCollections.push(newObjectId(collection));
        }
      }
    }

    let PropertyObjToUpdate = {
      ...req.body,
    };

    if (validCollections && validCollections?.length > 0) {
      PropertyObjToUpdate["collections"] = validCollections;
    }

    if (pdf && pdf.includes("base64")) {
      PropertyObjToUpdate["pdf"] = await storeFileAndReturnNameBase64(pdf);
    }

    if (mealImage && mealImage.includes("base64")) {
      PropertyObjToUpdate["mealImage"] = await storeFileAndReturnNameBase64(mealImage);
    }

    if (mixMenuImage && mixMenuImage.includes("base64")) {
      console.log(mixMenuImage, "mixMenuImage");
      PropertyObjToUpdate["mixMenuImage"] = await storeFileAndReturnNameBase64(mixMenuImage);
    }

    if (nonVegMenuImage && nonVegMenuImage.includes("base64")) {
      PropertyObjToUpdate["nonVegMenuImage"] = await storeFileAndReturnNameBase64(nonVegMenuImage);
    }

    if (name) {
      PropertyObjToUpdate.slug = await getProductUinqueSlug(name);
    }

    if (mainImage && mainImage.includes("base64")) {
      PropertyObjToUpdate["mainImage"] = await storeFileAndReturnNameBase64(mainImage);
    }

    let tempRoom: any = rooms;
    if (rooms && rooms?.length > 0) {
      for (const room of rooms) {
        if (room.image && room.image.includes("base64")) {
          let image = await storeFileAndReturnNameBase64(room.image, room.title.replace(" ", "").toLowerCase());
          if (image) {
            room.image = image;
          }
        }
      }
      PropertyObjToUpdate["rooms"] = tempRoom;
    }

    let tempAmenity: any = [];
    if (amenities && amenities?.length > 0) {
      console.log("rendering amenities");
      for (const amenity of amenities) {
        if (amenity) {
          if (amenity.amenityId && typeof amenity.amenityId == "string") {
            let amenityObj = await Amenity.findById(newObjectId(amenity.amenityId));
            console.log(true, "amenityObj||");
            if (amenityObj) {
              let amentiy = {
                amenityCategoryName: amenityObj?.amenityCategoryName,
                amenityCategoryId: amenityObj?.amenityCategoryId,
                name: amenityObj?.name,
                amenityId: amenityObj?._id,
              };
              tempAmenity.push(amentiy);
            }
          }
        }
      }
      PropertyObjToUpdate["amenities"] = tempAmenity;
    }

    console.log(JSON.stringify(PropertyObjToUpdate.amenities, null, 2), "PropertyObjToUpdate");

    let tempGalleries: any = galleries;
    if (galleries && galleries?.length > 0) {
      for (const gallery of galleries) {
        if (gallery && gallery?.imageList?.length > 0) {
          let images: any = gallery?.imageList;
          let k = 0;
          for (const element of images) {
            if (element && element?.dataURL && element?.dataURL?.includes("base64")) {
              let image = await storeFileAndReturnNameBase64(
                element?.dataURL,
                gallery.name.replace(" ", "").toLowerCase() + k,
              );
              if (image) {
                images[k] = image;
              }
            }
            k++;
          }
          gallery.imageList = images;
        }
      }
      PropertyObjToUpdate["galleries"] = galleries;
    }

    // Commented out hassle check as per original code
    // const checkHassle = await Property.find();
    // if (PropertyObjToUpdate.hassle == true) {
    //   const trueHassleCount = checkHassle.filter((property: any) => property.hassle === true).length + 1;
    //   console.log(trueHassleCount, "trueHassleCount");
    //   if (trueHassleCount > 4) throw new Error("Cannot have more than 4 hassle properties.");
    // }

    const updatedProperty = await findByIdAndUpdate<IProperty>(
      Property,
      newObjectId(req.params.id),
      PropertyObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.PROPERTY.UPDATED, data: updatedProperty });
  } catch (error) {
    console.log("ERROR IN UPDATE PROPERTY CONTROLLER:", error);
    next(error);
  }
};

export const deletProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) {
      throw new Error("Invalid id provided");
    }

    // const PropertyObj: IProperty | any = await throwIfNotExist(
    //   Property,
    //   { _id: new mongoose.Types.ObjectId(req.params.id) , isDeleted: false },
    //   ERROR.PROPERTY.NOT_FOUND,
    // );

    await Property.deleteOne({ _id: newObjectId(req.params.id) });

    await mongoose.connection.collection("reviews").deleteMany({ propertyId: newObjectId(req.params.id) });

    res.status(200).json({ message: MESSAGE.PROPERTY.REMOVED });
  } catch (error) {
    console.log("ERROR IN PROPERTY CONTROLLER");
    next(error);
  }
};
//

export const requestPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(moment(startDate).format("YYYY-MM-DD"));
    endDate = new Date(moment(endDate).format("YYYY-MM-DD"));
    startDate.setDate(1);
    endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // last day of current month
    const dateMatchFilter = {
      $expr: {
        $and: [{ $lte: ["$startDate", endDate] }, { $gte: ["$endDate", startDate] }],
      },
    };
    let pipeline = [
      {
        $match: {
          orderStatus: "CONFIRMED",
          ...dateMatchFilter,
          propertyId: newObjectId(req.params.id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ];
    const property = await Property.findById(req.params.id, { sellerId: 1,name:1, _id: 0 }).lean();
    let sellerMailId = null;
    if (property && property.sellerId) {
      sellerMailId = await User.findById(property.sellerId, { email: 1, name: 1, _id: 0 }).lean();
    }
    const bookingData = await Order.aggregate(pipeline);
    console.log("🚀 ---------------------------------------------🚀")
    console.log("🚀 ~ requestPayout ~ bookingData:", bookingData)
    console.log("🚀 ---------------------------------------------🚀")

    let title = "<title>StayCationer Payout Request</title>";

    let content = `
<div class="container">
  <!-- Header -->
  <div class="header">
    <img src="https://thestaycationer.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
    <h1 class="confirmation-title">Payout Request Received</h1>
  </div>

  <!-- Request Summary -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3v1H7a4 4 0 00-4 4v1h18v-1a4 4 0 00-4-4h-2v-1c0-1.657-1.343-3-3-3z" />
      </svg>
      <h2 class="section-title">Seller Payout Request</h2>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Name:</div>
      <div class="detail-value">${sellerMailId?.name}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Property:</div>
      <div class="detail-value">${property?.name}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Revenue (This Month):</div>
      <div class="detail-value">₹${bookingData[0]?.total??0}</div>
    </div>
  </div>

  <!-- Highlight Box -->
  <div class="highlight-box">
    <p><strong>Action Required:</strong> Please review this payout request and process accordingly.</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>StayCationer Admin Dashboard</p>
    <p>© ${new Date().getFullYear()} StayCationer. All rights reserved.</p>
  </div>
</div>
`;

    let style = `
<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .header {
    background: linear-gradient(135deg, #FF7B25 0%, #FFA500 100%);
    padding: 30px 20px;
    text-align: center;
    color: white;
  }

  .logo {
    height: 40px;
    margin-bottom: 10px;
  }

  .confirmation-title {
    font-size: 26px;
    font-weight: 700;
    margin: 10px 0;
    color: white;
  }

  .section {
    padding: 20px 25px;
    border-bottom: 1px solid #f0f0f0;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .section-icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    color: #FF7B25;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #FF7B25;
    margin: 0;
  }

  .detail-row {
    display: flex;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .detail-label {
    flex: 1 0 120px;
    font-weight: 600;
    color: #555;
    min-width: 120px;
  }

  .detail-value {
    flex: 2;
    color: #333;
    min-width: 150px;
  }

  .highlight-box {
    background-color: #FFF9F2;
    border-left: 4px solid #FF7B25;
    padding: 15px;
    margin: 15px 25px;
    border-radius: 0 4px 4px 0;
  }

  .footer {
    padding: 20px;
    text-align: center;
    background-color: #f8f9fa;
    font-size: 12px;
    color: #777;
  }

  @media only screen and (max-width: 600px) {
    .container {
      margin: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .confirmation-title {
      font-size: 22px;
    }

    .section {
      padding: 15px;
    }

    .detail-label {
      flex: 1 0 100%;
      margin-bottom: 5px;
    }

    .detail-value {
      flex: 1 0 100%;
      padding-left: 15px;
    }
  }
</style>
`;
    let html = generateHTML(title, content, style);
    const adminmail = await SendBrevoMail(
      "Your StayCationer Booking Confirmation",
      [{ email: "info@thestaycationer.in", name: "staycation" }],
      html,
    );

    title = "<title>StayCationer Payout Confirmation</title>";

    content = `
<div class="container">
  <!-- Header -->
  <div class="header">
    <img src="https://thestaycationer.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
    <h1 class="confirmation-title">Payout Request Confirmed</h1>
  </div>

  <!-- Request Summary -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2zM5 20h14v-1c0-2.209-1.791-4-4-4H9c-2.209 0-4 1.791-4 4v1z" />
      </svg>
      <h2 class="section-title">Payout Details</h2>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Name:</div>
      <div class="detail-value">${sellerMailId?.name}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Property:</div>
      <div class="detail-value">${property?.name}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Revenue (This Month):</div>
      <div class="detail-value">₹${bookingData[0]?.total}</div>
    </div>
  </div>

  <!-- Processing Time -->
  <div class="highlight-box">
    <p><strong>Good news!</strong> Your payout request has been received and will be processed within <strong>5 to 8 working days</strong>.</p>
    <p>Please ensure your bank details are up to date in your seller dashboard to avoid any delays.</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Thank you for partnering with StayCationer.</p>
    <p>© ${new Date().getFullYear()} StayCationer. All rights reserved.</p>
  </div>
</div>
`;

    style = `
<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .header {
    background: linear-gradient(135deg, #ff7e5f 0%, #ff6600 100%);
    padding: 30px 20px;
    text-align: center;
    color: white;
  }

  .logo {
    height: 40px;
    margin-bottom: 10px;
  }

  .confirmation-title {
    font-size: 26px;
    font-weight: 700;
    margin: 10px 0;
    color: white;
  }

  .section {
    padding: 20px 25px;
    border-bottom: 1px solid #f0f0f0;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .section-icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    color: #ff6600;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #ff6600;
    margin: 0;
  }

  .detail-row {
    display: flex;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .detail-label {
    flex: 1 0 120px;
    font-weight: 600;
    color: #555;
    min-width: 120px;
  }

  .detail-value {
    flex: 2;
    color: #333;
    min-width: 150px;
  }

  .highlight-box {
    background-color: #FFF5F0;
    border-left: 4px solid #ff6600;
    padding: 15px;
    margin: 15px 25px;
    border-radius: 0 4px 4px 0;
    font-size: 14px;
  }

  .footer {
    padding: 20px;
    text-align: center;
    background-color: #f8f9fa;
    font-size: 12px;
    color: #777;
  }

  /* Responsive */
  @media only screen and (max-width: 600px) {
    .container { margin: 0; border-radius: 0; box-shadow: none; }
    .confirmation-title { font-size: 22px; }
    .section { padding: 15px; }
    .detail-label { flex: 1 0 100%; margin-bottom: 5px; }
    .detail-value { flex: 1 0 100%; padding-left: 15px; }
  }
</style>
`;

    const htmlSeller = generateHTML(title, content, style);
    if (sellerMailId && sellerMailId?.email) {
      await SendBrevoMail(
        "StayCationer Payout Request Confirmation",
        [{ email: sellerMailId?.email ?? "", name: sellerMailId?.name ?? "" }],
        htmlSeller,
      );
    }

    console.log("🚀 -------------------------------🚀");
    console.log("🚀 ~ requestPayout ~ user:", adminmail);
    console.log("🚀 -------------------------------🚀");
    res.json({ message: "Payout request sent successfully", data: bookingData[0] });
  } catch (error) {
    console.log("ERROR IN REQUEST PAYOUT CONTROLLER:", error);
    next(error);
  }
};
