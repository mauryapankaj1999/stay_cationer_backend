import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { getProductUinqueSlug } from "helpers/slug";
import { Blog, IBlog } from "models/blog.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const creatBlog = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "COLLECTION BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IBlog>(
      Blog,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.COLLECTION.EXIST,
    );

    const newBlogObj = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    if (thumbnail && typeof thumbnail === "string") {
      newBlogObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newBlog: any = await createDocuments<IBlog>(Blog, newBlogObj);

    res.status(200).json({ message: MESSAGE.COLLECTION.CREATED, data: newBlog._id });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const getBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    console.log("req.query", req.query);
    if (req.query.status && req.query.status !== "") {
      matchObj.status = req.query.status;
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

    const BlogArr = await paginateAggregate(Blog, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COLLECTION.ALLCOLLECTION, data: BlogArr.data, total: BlogArr.total });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BlogObj = await throwIfNotExist(
      Blog,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.COLLECTION.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.COLLECTION.GOTBYID, data: BlogObj });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("BlogObj", req.params.slug);
    // const BlogObj = await throwIfNotExist(
    //   Blog,
    //   { slug: req.params.slug, isDeleted: false },
    //   ERROR.COLLECTION.NOT_FOUND,
    // );

    let BlogObj: any = await Blog.findOne({
      _id: req.params.slug,
      isDeleted: false,
    })
      // .populat/e("category", "name")
      .exec();

    res.status(200).json({ message: MESSAGE.COLLECTION.GOTBYID, data: BlogObj });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const updatBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IBlog = req.body;

    let BlogObj: any = await throwIfNotExist(
      Blog,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.COLLECTION.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Blog,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.COLLECTION.EXIST,
      );
    }

    let BlogObjToUpdate = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    if (thumbnail && thumbnail.includes("base64")) {
      BlogObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedBlog = await findByIdAndUpdate<IBlog>(Blog, newObjectId(req.params.id), BlogObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.COLLECTION.UPDATED, data: updatedBlog });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const deletBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BlogObj: IBlog | any = await throwIfNotExist(
      Blog,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.COLLECTION.NOT_FOUND,
    );
    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Blog, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.COLLECTION.REMOVED });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};
