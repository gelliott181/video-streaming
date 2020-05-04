import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getVideo(
    @Req() request: Request,
    @Res() response: Response
  ) {
    const path = 'src/assets/Spring_-_Blender_Open_Movie.webm';
    const stat = await fs.promises.stat(path);

    if (request.headers.range) {
      const [ 
        start, 
        end = (stat.size - 1) 
      ] = request.headers.range
        .replace(/bytes=/, '')
        .split('-')
        .map((part) => parseInt(part, 10))
        .filter((part) => !isNaN(part));
      
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(path, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/webm'
      };
      
      response.writeHead(206, head);
      file.pipe(response);
    } else {
      const head = {
        'Content-Length': stat.size,
        'Content-Type': 'video/webm'
      };

      response.writeHead(200, head);
      fs.createReadStream(path).pipe(response);
    }
  }
}
