import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';

import {
    paginate,
    Pagination,
    IPaginationOptions,
} from 'nestjs-typeorm-paginate';

import {Vehicle} from "./entities/vehicle.entity";

import {CreateVehicleDto} from "./dto/create-vehicle.dto";
import {UpdateVehicleDto} from "./dto/update-vehicle.dto";

import {Film} from "../films/entities/film.entity";
@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
        @InjectRepository(Film)
        private readonly filmsRepository: Repository<Film>,
    ) {}
    paginate(options: IPaginationOptions): Promise<Pagination<Vehicle>> {
        return paginate<Vehicle>(this.vehiclesRepository, options, {
            relations: ['pilots', 'films']
        });
    }
    async findOne(id: number) {
        let vehicle = await this.vehiclesRepository.findOne({
            where: {
                id: id
            },
            relations: ['pilots', 'films']
        })

        return vehicle;
    }
    async store(data: CreateVehicleDto) {
        let vehicle = await this.vehiclesRepository.create(data);

        const films = await this.filmsRepository.find({
            where: {
                id: In([...data.filmIds])
            }
        })

        vehicle.films = films;

        return this.vehiclesRepository.save(data);
    }
    async update(id: number, data: UpdateVehicleDto) {

        let starship = await this.vehiclesRepository.findOne({where: {id: id}, relations: ["films"]})

        const films = await this.filmsRepository.find({
            where: {
                id: In([...data.filmIds])
            }
        })

        starship.films = films;

        await this.vehiclesRepository.save(starship)

        return 'ok';
    }
    async delete(id: number) {

        let vehicle = await this.vehiclesRepository.findOne({
            where: {
                id: id
            }
        })

        await this.vehiclesRepository.delete(id);

        return 'ok';

    }

}