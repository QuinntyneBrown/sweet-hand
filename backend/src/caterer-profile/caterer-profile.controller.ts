import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { roles, type Reply, type Request } from '../http/endpoint.ts';
import { Ctx, MaxBody, UsePolicy } from '../http/nest/decorators.ts';
import { ownProfile, referenceData } from './profile.ts';
import { saveSection } from './sections.ts';
import { addDish, removeDish, reorderDishes, updateDish } from './menu.ts';
import { submitProfile, withdrawSubmission } from './submission.ts';
import { CERTIFICATE_BODY_BYTES, certificateFileUrl, ownCertificateFile, removeCertificateFile, saveCertificate, uploadCertificateFile } from './certificate.ts';
import { PHOTO_BODY_BYTES, removePhoto, reorderPhotos, replacePhoto, restorePhoto, updatePhoto, uploadPhoto } from './photos.ts';

const caterer = roles('Caterer');

/** The signed-in caterer's own profile (docs/detailed-designs/caterer-profiles). Every route reaches only the caller's profile. */
@Controller()
export class CatererProfileController {
  @Get('api/caterer/profile')
  @UsePolicy(caterer)
  ownProfile(@Ctx() req: Request): Promise<Reply> {
    return ownProfile(req);
  }

  @Get('api/caterer/profile/reference-data')
  @UsePolicy(caterer)
  referenceData(@Ctx() req: Request): Promise<Reply> {
    return referenceData(req);
  }

  @Put('api/caterer/profile/sections/:section')
  @UsePolicy(caterer)
  saveSection(@Ctx() req: Request): Promise<Reply> {
    return saveSection(req);
  }

  /** Photos (manage-photos design) */
  @Post('api/caterer/profile/photos')
  @UsePolicy(caterer)
  @MaxBody(PHOTO_BODY_BYTES)
  uploadPhoto(@Ctx() req: Request): Promise<Reply> {
    return uploadPhoto(req);
  }

  @Post('api/caterer/profile/photos/:id/replacement')
  @UsePolicy(caterer)
  @MaxBody(PHOTO_BODY_BYTES)
  replacePhoto(@Ctx() req: Request): Promise<Reply> {
    return replacePhoto(req);
  }

  @Put('api/caterer/profile/photos/order')
  @UsePolicy(caterer)
  reorderPhotos(@Ctx() req: Request): Promise<Reply> {
    return reorderPhotos(req);
  }

  @Patch('api/caterer/profile/photos/:id')
  @UsePolicy(caterer)
  updatePhoto(@Ctx() req: Request): Promise<Reply> {
    return updatePhoto(req);
  }

  @Delete('api/caterer/profile/photos/:id')
  @UsePolicy(caterer)
  removePhoto(@Ctx() req: Request): Promise<Reply> {
    return removePhoto(req);
  }

  @Post('api/caterer/profile/photos/:id/restoration')
  @UsePolicy(caterer)
  restorePhoto(@Ctx() req: Request): Promise<Reply> {
    return restorePhoto(req);
  }

  /** Food handler certificate (provide-food-handler-certificate design) */
  @Put('api/caterer/profile/certificate')
  @UsePolicy(caterer)
  saveCertificate(@Ctx() req: Request): Promise<Reply> {
    return saveCertificate(req);
  }

  @Post('api/caterer/profile/certificate/file')
  @UsePolicy(caterer)
  @MaxBody(CERTIFICATE_BODY_BYTES)
  uploadCertificateFile(@Ctx() req: Request): Promise<Reply> {
    return uploadCertificateFile(req);
  }

  @Get('api/caterer/profile/certificate/file-url')
  @UsePolicy(caterer)
  certificateFileUrl(@Ctx() req: Request): Promise<Reply> {
    return certificateFileUrl(req);
  }

  /** The link's token and the owner's session are both needed. */
  @Get('api/caterer/certificate-files/:token')
  @UsePolicy(caterer)
  ownCertificateFile(@Ctx() req: Request): Promise<Reply> {
    return ownCertificateFile(req);
  }

  @Delete('api/caterer/profile/certificate/file')
  @UsePolicy(caterer)
  removeCertificateFile(@Ctx() req: Request): Promise<Reply> {
    return removeCertificateFile(req);
  }

  /** Submission (submit-profile-for-review design) */
  @Post('api/caterer/profile/submission')
  @UsePolicy(caterer)
  submitProfile(@Ctx() req: Request): Promise<Reply> {
    return submitProfile(req);
  }

  @Delete('api/caterer/profile/submission')
  @UsePolicy(caterer)
  withdrawSubmission(@Ctx() req: Request): Promise<Reply> {
    return withdrawSubmission(req);
  }

  /** Menu (manage-menu design); `order` is registered before `:id`. */
  @Post('api/caterer/profile/menu-items')
  @UsePolicy(caterer)
  addDish(@Ctx() req: Request): Promise<Reply> {
    return addDish(req);
  }

  @Put('api/caterer/profile/menu-items/order')
  @UsePolicy(caterer)
  reorderDishes(@Ctx() req: Request): Promise<Reply> {
    return reorderDishes(req);
  }

  @Put('api/caterer/profile/menu-items/:id')
  @UsePolicy(caterer)
  updateDish(@Ctx() req: Request): Promise<Reply> {
    return updateDish(req);
  }

  @Delete('api/caterer/profile/menu-items/:id')
  @UsePolicy(caterer)
  removeDish(@Ctx() req: Request): Promise<Reply> {
    return removeDish(req);
  }
}
