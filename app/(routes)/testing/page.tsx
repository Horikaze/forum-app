"use client";

import GETHandlerImage from "@/app/components/forumComponents/GETHandlerImage";

export default function Testing() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-[1200px] h-[400px]">
        <GETHandlerImage
          commentsCount={1}
          nickname={"1233131"}
          profileImage={""}
          reactionsCount={1}
          featuredImage="/files/9zNlqAmL11jqgmyjuo_jz-avatar.png"
          title={"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Placeat vitae laboriosam repellat dolorum. Delectus, reiciendis a. Cumque doloremque consectetur ratione."}
          subTitle={"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Placeat vitae laboriosam repellat dolorum. Delectus, reiciendis a. Cumque doloremque consectetur ratione."}
        />
      </div>
    </div>
  );
}
