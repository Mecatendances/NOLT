import { IsString, IsOptional, IsObject, IsEmail } from 'class-validator';

export class UpdateShopBrandingDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };

  @IsString()
  @IsOptional()
  footerText?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;
} 