import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {User} from "./entities/user.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {
    }
    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOneBy({username: username})
    }
    async create(username: string, password: string): Promise<User> {
        const user = this.usersRepository.create({
            username: username,
            password: password,
            role: 'user'
        });

        return this.usersRepository.save(user);
    }

}
