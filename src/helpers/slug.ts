export const getProductUinqueSlug = async (name: string) => {
  try {
    let slugify = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // let productCount =  await Category.find({ slug: new RegExp(`^${slugify}$`) }).countDocuments();
    // if(productCount != 0){
    //     slugify += '-'+Date.now() ;
    // }
    return slugify;
  } catch (error) {
    console.log(error);
    return "";
  }
};
