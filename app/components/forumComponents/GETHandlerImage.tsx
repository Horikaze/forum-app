import React from "react";
import { FaComment, FaRegFaceSmile } from "react-icons/fa6";

type GETHandlerImageProps = {
  nickname: string;
  profileImage: string;
  likesCount: number;
  title: string;
  subTitle: string;
  commentsCount: number;
};

export default function GETHandlerImage({
  commentsCount,
  likesCount,
  subTitle,
  title,
  profileImage,
  nickname,
}: GETHandlerImageProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        gap: "10px",
        backgroundColor: "#ffffff",
        color: "#0e0e0e",
        padding: "50px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "10px",
          fontWeight: "bold",
        }}
      >
        <img
          src={profileImage}
          alt=""
          width={100}
          height={100}
          style={{ borderRadius: "50%" }}
        />
        <p style={{ fontSize: "50px" }}>{nickname}</p>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <FaComment style={{ width: "50px", height: "50px" }} />
          <span style={{ fontSize: "65px" }}>{commentsCount}</span>
          <FaRegFaceSmile style={{ width: "50px", height: "50px" }} />
          <span style={{ fontSize: "65px" }}>{likesCount}</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          // alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <p style={{ fontSize: "50px" }}>{title}</p>
        <p
          style={{
            fontSize: "40px",
            fontWeight: "normal",
            opacity: 0.7,
          }}
        >
          {subTitle}
        </p>
      </div>
    </div>
  );
}
