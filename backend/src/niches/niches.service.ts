import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';
import { CreateNicheDto } from './dto/create-niche.dto';
import { UpdateNicheDto } from './dto/update-niche.dto';
import { Niche } from './niches.schema';
import { BusinessesService } from 'src/businesses/businesses.service';

@Injectable()
export class NichesService {
  constructor(
    @InjectModel('niche') private nicheModel: Model<Niche>,
    private productService: ProductsService,
    private businessService: BusinessesService,
  ) {}

  async create(createNicheDto: CreateNicheDto) {
    try {
      const createdProduct = await this.nicheModel.create({
        ...createNicheDto,
      });
      // Update products when we used it in niche
      if (createNicheDto?.products?.length) {
        createNicheDto?.products?.forEach(async (product) => {
          const productData = await this.productService.findOne(product);
          const niches = [
            ...productData.usedByNiches,
            createdProduct?._id?.toString(),
          ];
          await this.productService.update(product, {
            usedByNiches: [...new Set(niches)],
          });
        });
      }
      return createdProduct;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const page = Number(query?.page) || 0;
      const limit = Number(query?.limit) || 0;
      const data = await this.nicheModel
        .find(query)
        .populate('products')
        .populate({
          path: 'productMockups',
          populate: {
            path: 'mockups',
            model: 'files',
          },
        })
        // where deleted is false OR the field is not present
        .where({
          $or: [{ deleted: false }, { deleted: { $exists: false } }],
        })
        .sort(query?.sort || {})
        .skip(((page || 0) - 1) * (limit || 0))
        .limit(limit || 0);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async countTotalData(query?: Record<string, any>) {
    try {
      const totalData = await this.nicheModel.countDocuments(query).where({
        $or: [{ deleted: false }, { deleted: { $exists: false } }],
      });
      return totalData;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.nicheModel
        .findById(id)
        .populate('products')
        .populate({
          path: 'productMockups',
          populate: [
            {
              path: 'mockups',
              model: 'files',
            },
            {
              path: 'mobileMockups',
              model: 'files',
            },
            {
              path: 'desktopMockups',
              model: 'files',
            },
          ],
        })
        .where({
          $or: [{ deleted: false }, { deleted: { $exists: false } }],
        });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, updateNicheDto: UpdateNicheDto) {
    try {
      const updatedProduct = await this.nicheModel.findByIdAndUpdate(
        id,
        updateNicheDto,
        {
          new: true,
        },
      );
      // Update products when we used it in niche
      if (updateNicheDto?.products?.length) {
        updateNicheDto?.products?.forEach(async (product) => {
          const productData = await this.productService.findOne(product);
          const niches = [
            ...productData.usedByNiches,
            updatedProduct?._id?.toString(),
          ];
          await this.productService.update(product, {
            usedByNiches: [...new Set(niches)],
          });
        });
      }
      return updatedProduct;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async remove(id: string) {
    try {
      // const niche = await this.nicheModel.findById(id);
      // Update products when we used it in niche
      // if (niche?.products?.length) {
      //   niche?.products?.forEach(async (product) => {
      //     const productData = await this.productService.findOne(product);
      //     await this.productService.update(product, {
      //       usedByNiches: productData.usedByNiches.filter(
      //         (item) => item?.toString() !== niche?._id?.toString(),
      //       ),
      //     });
      //   });
      // }
      return await this.nicheModel.updateOne({ _id: id }, { deleted: true });
      // return await this.nicheModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  // Get business count using this niche
  async getBusinessInNiche(id: string) {
    try {
      const count = await this.businessService.countTotalData({
        niche: id,
      });
      // business in niche
      const business = await this.businessService.findAll({
        niche: id,
      });
      return { business, count };
    } catch (error) {
      throw new Error(error);
    }
  }
}
