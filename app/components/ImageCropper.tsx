import React, { useEffect, useRef, useState } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type ImageCropperProps = {
  aspect: number;
  onCropChange: (croppedImage: File | null) => void;
};

const ImageCropper = ({ aspect, onCropChange }: ImageCropperProps) => {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || ""),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ): Crop => {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
      mediaWidth,
      mediaHeight,
    );
  };

  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate,
      );
    }
  }, [completedCrop, scale, rotate]);

  const canvasPreview = (
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale: number = 1,
    rotate: number = 0,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = rotate * (Math.PI / 180);
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropChange(new File([blob], "avatar.png", { type: blob.type }));
        }
      },
      "image/jpeg",
      0.95,
    );
    ctx.restore();
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1">
        <input
          type="file"
          className="file-input"
          accept="image/*"
          onChange={onSelectFile}
        />
        <label htmlFor="scale-input">Skala:</label>
        <input
          id="scale-input"
          type="range"
          step={0.1}
          max={10}
          min={1}
          className="range"
          value={scale}
          disabled={!imgSrc}
          onChange={(e) => setScale(Number(e.target.value))}
        />
        <label htmlFor="rotate-input">Rotacja: </label>
        <input
          id="rotate-input"
          type="range"
          value={rotate}
          step={1}
          min={-90}
          className="range"
          max={90}
          disabled={!imgSrc}
          onChange={(e) =>
            setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
          }
        />
      </div>
      <div className="flex h-full flex-col gap-2 lg:flex-row">
        <div className="flex flex-1 items-center justify-center overflow-hidden rounded-box">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minHeight={20}
              className="max-h-[600px]"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          {completedCrop && (
            <>
              <span className="mb-2 text-xl font-semibold">Podgląd</span>
              <canvas
                ref={previewCanvasRef}
                className="size-64 rounded-box object-contain"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;