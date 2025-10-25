import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { getProductUinqueSlug } from "helpers/slug";
import { Page, IPage } from "models/page.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

/**
 * Helper function to process base64 images in an array of section items
 * @param sectionItems Array of items containing images
 * @returns The processed array with stored images
 */
const processSectionImages = async (sectionItems: any[]) => {
  if (!sectionItems || !sectionItems.length) return null;
  
  const processedItems = [...sectionItems];
  
  for (const item of processedItems) {
    if (item.image && typeof item.image === "string" && item.image.includes("base64")) {
      const storedImage = await storeFileAndReturnNameBase64(item.image);
      if (storedImage) {
        item.image = storedImage;
      }
    }
  }
  
  return processedItems;
};

/**
 * Process single image from a section
 * @param section Section object containing image
 * @returns Image filename or null
 */
const processSingleImage = async (section: any) => {
  if (!section || !section.image || typeof section.image !== "string" || !section.image.includes("base64")) {
    return null;
  }
  
  return await storeFileAndReturnNameBase64(section.image);
};

/**
 * Create a new page
 */
export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, section1, section2, section3, section4 , section5} = req.body;
    console.log("req.body", req.body);
    console.log("section5", section5);
    
    // Validate required fields
    verifyRequiredFields({ Name: name });

    // Check if page already exists
    await throwIfExist<IPage>(
      Page,
      { name: newRegExp(name), isDeleted: false },
      ERROR.PAGE.EXIST
    );

    // Create new page object with slug
    const newPageObj = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    // Process images in sections
    if (section1) {
      console.log("section1", section1);
      const processedSection1 = await processSectionImages(section1);
      if (processedSection1) newPageObj.section1 = { ...section2, image: processedSection1 };
    }

    if (section2) {
      console.log("section2", section2);
      const processedImage = await processSingleImage(section2);
      if (processedImage) newPageObj.section2 = { ...section2, image: processedImage };
    }

    if (section3) {
      const processedSection3 = await processSectionImages(section3);
      if (processedSection3) newPageObj.section3 = processedSection3;
    }

    if (section4) {
      console.log("section4", section4);
      const processedImage = await processSingleImage(section4);
      if (processedImage) newPageObj.section4 = { ...section4, image: processedImage };
    }



  
    if (section5) {
      const processedsection5 = await processSectionImages(section5);
      if (processedsection5) newPageObj.section5 = processedsection5;
    }

    // Create the new page in database
    const newPage = await createDocuments<IPage>(Page, newPageObj);

    res.status(200).json({ message: MESSAGE.PAGE.CREATED, data: newPage._id });
  } catch (error) {
    console.log("ERROR IN CREATE PAGE CONTROLLER", error);
    next(error);
  }
};

/**
 * Get all pages with pagination
 */
export const getPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set up match condition for deleted/active pages
    const matchObj = { isDeleted: req.query.isDeleted === "true" };

    // Create aggregation pipeline
    const pipeline: PipelineStage[] = [
      { $sort: { createdAt: -1 } },
      { $match: matchObj }
    ];

    // Get paginated results
    const pageResults = await paginateAggregate(Page, pipeline, req.query);

    res.status(200).json({ 
      message: MESSAGE.PAGE.ALLPAGE, 
      data: pageResults.data, 
      total: pageResults.total 
    });
  } catch (error) {
    console.log("ERROR IN GET PAGES CONTROLLER", error);
    next(error);
  }
};

/**
 * Get a specific page by ID
 */
export const getPageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find page and throw error if not found
    const page = await throwIfNotExist(
      Page,
      { type: req.params.id, isDeleted: false },
      ERROR.PAGE.NOT_FOUND
    );

    res.status(200).json({ message: MESSAGE.PAGE.GOTBYID, data: page });
  } catch (error) {
    console.log("ERROR IN GET PAGE BY ID CONTROLLER", error);
    next(error);
  }
};

/**
 * Update an existing page
 */
export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, section1, section2, section3, section4 , section5} = req.body;
    const pageId = req.params.id;

    // Check if page exists
    await throwIfNotExist(
      Page,
      { _id: newObjectId(pageId), isDeleted: false },
      ERROR.PAGE.NOT_FOUND
    );

    // if (name) {
    //   await throwIfExist(
    //     Page,
    //     {
    //       _id: { $ne: newObjectId(pageId) },
    //       isDeleted: false,
    //       name: newRegExp(name)
    //     },
    //     ERROR.PAGE.EXIST
    //   );
    // }

    // Create update object
    const updateData = { ...req.body };

    // Process images in sections
    if (section1) {
      console.log("section1", section1);
      const processedSection1 = await processSectionImages(section1);
      if (processedSection1) updateData.section1 = processedSection1;
    }

    if (section2) {
      console.log("section2", section2);
      const processedImage = await processSingleImage(section2);
      if (processedImage) updateData.section2 = { ...section2, image: processedImage };
    }

    if (section3) {
      console.log("section3", section3);
      const processedSection3 = await processSectionImages(section3);
      if (processedSection3) updateData.section3 = processedSection3;
    }

    if (section4) {
      console.log("section4", section4);
      const processedImage = await processSingleImage(section4);
      if (processedImage) updateData.section4 = { ...section4, image: processedImage };
    }


    if (section5) {
      console.log("section5", section5);
      const processedsection5 = await processSectionImages(section5);
      if (processedsection5) updateData.section5 = processedsection5;
    }

    // Update the page
    const updatedPage = await findByIdAndUpdate<IPage>(
      Page, 
      newObjectId(pageId), 
      updateData, 
      { new: true }
    );
    console.log("updatedPage", updatedPage);

    res.status(200).json({ message: MESSAGE.PAGE.UPDATED, data: updatedPage });
  } catch (error) {
    console.log("ERROR IN UPDATE PAGE CONTROLLER", error);
    next(error);
  }
};

/**
 * Soft delete a page
 */
export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageId = req.params.id;
    
    // Check if page exists
    await throwIfNotExist(
      Page,
      { _id: newObjectId(pageId), isDeleted: false },
      ERROR.PAGE.NOT_FOUND
    );

    // Soft delete by setting isDeleted to true
    await findByIdAndUpdate(
      Page, 
      newObjectId(pageId), 
      { isDeleted: true }
    );

    res.status(200).json({ message: MESSAGE.PAGE.REMOVED });
  } catch (error) {
    console.log("ERROR IN DELETE PAGE CONTROLLER", error);
    next(error);
  }
};





