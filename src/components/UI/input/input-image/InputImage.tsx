import React, { useState } from "react";
import UploadIcon from "../../../icons/Upload";

type inputImageProps = {
  size?: string; //3x2 or 4x5
  direction?: string; // row or column
  alt: string;
  src?: string;
  id: string;
};

const InputImage = ({ size, direction, alt, src, id }: inputImageProps) => {
  const [image, setImage] = useState<string>(() => (src ? src : ""));
  const [loading, setLoading] = useState<boolean>(false);

  const uploadImageHandle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const data = new FormData();

    if (files) {
      data.append("file", files[0]);
      data.append("upload_preset", "upload-img");

      setLoading(true);

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dtitvei0p/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        if (!res.ok) return;

        const file = await res.json();

        setImage(file.secure_url);
      } catch (error: any) {
        console.log(error.message);
      }

      setLoading(false);
    }
  };
  return (
    <div
      className={"input__file" + (direction ? " direction-" + direction : "")}
    >
      <div className={"input__avatar" + (size ? " size-" + size : "")}>
        {loading ? <div>loading...</div> : <img src={image} alt={alt} />}
      </div>

      <input
        type="file"
        id={id}
        className="input--file"
        onChange={uploadImageHandle}
      />

      <label htmlFor={id}>
        <UploadIcon className="input__icon--upload" />
      </label>
    </div>
  );
};

export default InputImage;
