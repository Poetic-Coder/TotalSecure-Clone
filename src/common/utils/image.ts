import axios from "axios";
import * as buffer from "buffer";

export async function convertImageToBase64(imagePath: string) {
  const data = await axios.get<string>(imagePath)
    .then(response => response.data)
    .catch(error => console.log(error));
  if (!data) throw new Error("Error converting image to base64")
  const base64Data = buffer.Buffer.from(data).toString('base64');
  return base64Data
}
