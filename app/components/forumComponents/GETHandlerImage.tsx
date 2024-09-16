import React from "react";
import { FaComment, FaRegFaceSmile } from "react-icons/fa6";
import { IoChatboxEllipses } from "react-icons/io5";

type GETHandlerImageProps = {
  reactionsCount: number;
  featuredImage: string;
  title: string;
  subTitle: string;
  commentsCount: number;
};

export default function GETHandlerImage({
  commentsCount,
  reactionsCount,
  subTitle,
  title,
  featuredImage,
}: GETHandlerImageProps) {
  console.log(featuredImage);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <img
        src={
          featuredImage.startsWith("/")
            ? "http://localhost:3000" + featuredImage
            : featuredImage
        }
        style={{
          position: "absolute",
          inset: 0,
          height: "100%",
          width: "100%",
          objectFit: "cover",
          transition: "all",
        }}
        alt="preview"
      />
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(to bottom, transparent, transparent, rgba(0, 0, 0, 0.8))",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "30px",
          color: "white",
        }}
      >
        <p
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "55px",
            fontWeight: 700,
          }}
        >
          {title}
        </p>
        <p
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "40px",
            opacity: 0.9,
          }}
        >
          {subTitle}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          right: "30px",
          top: "30px",
          display: "flex",
          color: "#fff",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          borderRadius: "6px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <FaRegFaceSmile style={{ width: "50px", height: "50px" }} />
          <span style={{ fontSize: "50px", fontWeight: 700 }}>
            {reactionsCount}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <IoChatboxEllipses style={{ width: "50px", height: "50px" }} />
          <span style={{ fontSize: "50px", fontWeight: 700 }}>
            {commentsCount}
          </span>
        </div>
      </div>
    </div>
  );
}
