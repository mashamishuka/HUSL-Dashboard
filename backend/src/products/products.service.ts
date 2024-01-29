import { Model } from 'mongoose';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './products.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const createdProduct = await this.productModel.create({
        ...createProductDto,
      });
      return createdProduct;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const data = await this.productModel.find(query);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.productModel.findById(id);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const data = await this.productModel.updateOne(
        { _id: id },
        updateProductDto,
      );
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateMany(
    query: Record<string, any>,
    updateProductDto: UpdateProductDto,
  ) {
    try {
      const data = await this.productModel.updateMany(query, updateProductDto);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: string) {
    try {
      // check if product is used in niches
      const hasNiche = await this.productModel.findOne({
        _id: id,
        usedByNiches: { $exists: true, $not: { $size: 0 } },
      });
      if (hasNiche) {
        throw new Error('Product is used in niches');
      }
      const data = await this.productModel.deleteOne({
        _id: id,
      });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
