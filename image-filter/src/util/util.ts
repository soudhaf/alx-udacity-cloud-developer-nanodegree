import fs from "fs";
const axios = require('axios').default;
import Jimp = require("jimp");
import { AxiosResponse } from "axios";


// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // fix issue: Could not find MIME for Buffer <null>
      // https://github.com/oliver-moran/jimp/issues/775#issuecomment-521938738
      const photo = await axios({
        method: 'get',
        url: inputURL,
        responseType: 'arraybuffer'
      })
      .then(function (response: AxiosResponse) {
        return Jimp.read(response.data)
      })
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname + outpath, (img: any) => {
          resolve(__dirname + outpath);
        });
    } catch (error){
      reject(error)
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

// filterImageFromURL
// helper function to validate image url
// INPUTS
//    url: string - an image ural url to an image file
// RETURNS
//    boolean true if url is a valid image url syntax else false

export function isImageUrl(url: string) {
  // check valid url
  try{
    new URL(url)
  } catch (e) {
    return false;
  }
  // check url belongs to an image
  const regex = /.*\/.+\.(jpeg|jpg|png)$/g;
  return url.match(regex) !== null;
}