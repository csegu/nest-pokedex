import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';

import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

@Injectable()
export class SeedService {

  // constructor(private readonly pokemonService: PokemonService) {}
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly axiosAdapter: AxiosAdapter,
    ){}

  async executeSeed() {

    await this.pokemonModel.deleteMany({});//delete * from pokemons;

    const data = await this.axiosAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const dataDB: CreatePokemonDto[] = [];

    data.results.forEach( ({name, url}) => {
      const segments = url.split('/');
      const no:number = +segments[segments.length - 2];
      dataDB.push({no, name});
    })

    await this.pokemonModel.insertMany(dataDB);
    return 'Seed successfull';
  }
}
