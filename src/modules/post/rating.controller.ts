import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { RatingService } from "./rating.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller('rating')
export class RatingController {
    constructor(private readonly ratingService: RatingService) {}

    @Post('rate')
    @UseGuards(AuthGuard)
    async ratePost(@Body() body, @Res() res, @Req() req) {
        try {
            await this.ratingService.createOrUpdateRate(body.postId, req.user.id, body.rate);
            return res.status(HttpStatus.OK).send({ message: 'OK' });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
        }
    }

    @Get('rate/:postId')
    async getRatingByPost(@Res() res, @Param('postId') postId: string) {
        try {
            const rating = await this.ratingService.getRatingByPost(postId);

            return res.status(HttpStatus.OK).send(rating);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
        }
    }
}