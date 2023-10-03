import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './DTOs/create-report.dto';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './DTOs/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}
  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async updateApproval(id: number, approved: boolean) {
    const report = await this.repo.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;
    return this.repo.save(report);
  }

  generateEstimate({
    creator,
    model,
    lng,
    lat,
    year,
    mileage,
  }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('creator = :creator', { creator })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -10 AND 10', { lng })
      .andWhere('lat - :lat BETWEEN -10 AND 10', { lat })
      .andWhere('year - :year BETWEEN -5 AND 5', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
