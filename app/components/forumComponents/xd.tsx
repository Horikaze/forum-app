import React from "react";
import { FaComment, FaRegFaceSmile } from "react-icons/fa6";
import { IoChatboxEllipses } from "react-icons/io5";

type GETHandlerImageProps = {
  nickname: string;
  profileImage: string;
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
  profileImage,
  featuredImage,
  nickname,
}: GETHandlerImageProps) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: "30px",
        padding: "0.5rem",
        color: "white",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "block",
          aspectRatio: "3 / 1",
          width: "100%",
          backgroundColor: "var(--base-200)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "0.5rem",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "rgba(var(--base-300-rgb), 0.6)",
            padding: "0.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
            }}
          >
            <FaRegFaceSmile /> {reactionsCount}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
            }}
          >
            <IoChatboxEllipses /> {commentsCount}
          </div>
        </div>
        <img
          src={featuredImage}
          style={{
            objectFit: "cover",
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
          }}
          alt="preview"
        />
        <div
          style={{
            position: "relative",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.5rem",
            color: "white",
          }}
        >
          <p
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "1.25rem",
              fontWeight: 600,
              lineHeight: 1.5,
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
              fontSize: "0.875rem",
              fontWeight: 600,
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            {subTitle}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent, transparent, rgba(0,0,0,0.9))",
          }}
        />
      </div>
    </div>
  );
}
