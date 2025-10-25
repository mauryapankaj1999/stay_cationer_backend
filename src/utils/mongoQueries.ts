import mongoose, {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  AggregateOptions,
  PipelineStage,
} from "mongoose";

export async function find<T extends Document>(model: Model<T>, query: FilterQuery<T>): Promise<T[] | null> {
  return (await model.find(query).lean().exec()) as T[] | null;
}

export async function findOne<T extends Document>(model: Model<T>, query: FilterQuery<T>): Promise<T | null> {
  return (await model.findOne(query).lean().exec()) as T | null;
}

export async function findById<T extends Document>(model: Model<T>, id: string): Promise<T | null> {
  return (await model.findById(id).lean().exec()) as T | null;
}

export async function findByIdAndUpdate<T extends Document>(
  model: Model<T>,
  id: mongoose.Types.ObjectId,
  update: UpdateQuery<T>,
  options: QueryOptions = {},
): Promise<T | null> {
  return (await model.findByIdAndUpdate(id, update, options).lean().exec()) as T | null;
}

export async function createDocuments<T extends Document>(model: Model<T>, documents: Partial<T> | Partial<T>[]) {
  return await model.create(documents);
}

export async function updateMany<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  update: UpdateQuery<T>,
  options: any = {},
): Promise<any> {
  return await model.updateMany(filter, update, options);
}

export async function updateOne<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  update: UpdateQuery<T>,
  options: any = {},
): Promise<any> {
  return await model.updateOne(filter, update, options);
}

export async function aggregate<T extends Document>(
  model: Model<T>,
  pipeline: PipelineStage[],
  options: AggregateOptions = {},
): Promise<any[]> {
  return await model.aggregate(pipeline, options).exec();
}

export const newObjectId = (id: any): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id);

/**
 * Exist check
 */

export async function throwIfExist<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T>,
  errorMsg: string,
): Promise<boolean> {
  const exist = await model.findOne(query).lean().exec();
  if (exist) throw new Error(errorMsg);
  return true;
}

export async function throwIfNotExist<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T>,
  errorMsg: string,
): Promise<T | null> {
  const exist = (await model.findOne(query).lean().exec()) as T | null;
  if (!exist) throw new Error(errorMsg);
  return exist;
}
