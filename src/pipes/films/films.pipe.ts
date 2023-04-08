import {ArgumentMetadata, Injectable, NotFoundException, PipeTransform} from '@nestjs/common';
import {FilmsService} from "../../swapi/films/films.service";

@Injectable()
export class FilmsPipe implements PipeTransform {
  constructor(private readonly filmsService: FilmsService) {}
  async transform(id: number, metadata: ArgumentMetadata) {
    let film = await this.filmsService.findOne(id)

    if(!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }
  }
}
