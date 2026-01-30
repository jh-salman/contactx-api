import { uploadImageToCloudinary } from "../../lib/upload";

export interface UploadImageParams {
  file: Buffer | string;
  folder?: string;
  type?: 'card' | 'personal-info';
  subFolder?: 'logo' | 'profile' | 'cover' | 'image' | 'banner' | 'profile_img';
}

const uploadImage = async (params: UploadImageParams): Promise<string> => {
  const { file, folder, type, subFolder } = params;

  // Determine folder based on type and subFolder
  let finalFolder = folder;
  
  if (!finalFolder) {
    if (type === 'card') {
      if (subFolder === 'logo') {
        finalFolder = 'contactx/cards/logos';
      } else if (subFolder === 'profile') {
        finalFolder = 'contactx/cards/profiles';
      } else if (subFolder === 'cover') {
        finalFolder = 'contactx/cards/covers';
      } else {
        finalFolder = 'contactx/cards';
      }
    } else if (type === 'personal-info') {
      if (subFolder === 'logo') {
        finalFolder = 'contactx/personal-info/logos';
      } else if (subFolder === 'banner') {
        finalFolder = 'contactx/personal-info/banners';
      } else if (subFolder === 'profile_img') {
        finalFolder = 'contactx/personal-info/profiles';
      } else if (subFolder === 'image') {
        finalFolder = 'contactx/personal-info/images';
      } else {
        finalFolder = 'contactx/personal-info';
      }
    } else {
      finalFolder = 'contactx/uploads';
    }
  }

  const url = await uploadImageToCloudinary(file, finalFolder);
  return url;
};

const uploadMultipleImages = async (
  files: Array<{ file: Buffer | string; folder?: string; type?: 'card' | 'personal-info'; subFolder?: string }>
): Promise<string[]> => {
  const uploadPromises = files.map((fileData) => {
    const params: UploadImageParams = {
      file: fileData.file,
    };
    
    if (fileData.folder !== undefined) {
      params.folder = fileData.folder;
    }
    if (fileData.type !== undefined) {
      params.type = fileData.type;
    }
    if (fileData.subFolder !== undefined) {
      params.subFolder = fileData.subFolder as any;
    }
    
    return uploadImage(params);
  });

  return Promise.all(uploadPromises);
};

export const uploadServices = {
  uploadImage,
  uploadMultipleImages,
};

