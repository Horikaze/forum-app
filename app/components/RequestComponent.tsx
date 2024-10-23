"use client";
import { areDatesEqual, formatDatePost } from "@/app/utils/formatDate";
import { Request } from "@prisma/client";
import toast from "react-hot-toast";
import { FaCheckCircle, FaTrash } from "react-icons/fa";
import {
  FaCalendar,
  FaCheck,
  FaCircleXmark,
  FaClock,
  FaX,
} from "react-icons/fa6";
import {
  actionRequestType,
  editRequestAction,
} from "../(routes)/admin/adminActions";

export const RequestComponent = ({
  req,
  isAdmin,
}: {
  req: Request;
  isAdmin: boolean;
}) => {
  const icons: { [key: string]: JSX.Element } = {
    pending: <FaClock className="size-6" />,
    approved: <FaCheckCircle className="size-6 text-success" />,
    rejected: <FaCircleXmark className="size-6 text-warning" />,
  };
  const editReq = async (action: actionRequestType) => {
    try {
      await editRequestAction(req.id, action);
      toast.success("Zaaktulizowano");
    } catch (error) {
      toast.error(`${error}`);
    }
  };
  return (
    <div className="group line-clamp-2 flex cursor-pointer items-center justify-between gap-px overflow-visible rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100">
      <div>
        <div className="line-clamp-2">{req.message}</div>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <FaCalendar /> {formatDatePost(req.createdAt)}
          {!areDatesEqual(req.createdAt, req.updatedAt) ? (
            <span className="text-xs opacity-60">
              (Zaaktulizowano: {formatDatePost(req.updatedAt)})
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 font-semibold">
        <div className="flex items-center justify-center gap-2 group-hover:flex">
          {isAdmin ? (
            <>
              <button
                onClick={() => editReq("approve")}
                className="btn btn-circle btn-primary btn-xs tooltip flex items-center"
                data-tip="Na pewno chcesz akceptować zapytanie? (upewnij się że zostały dodane np. osiągnięcia)"
              >
                <FaCheck />
              </button>
              <button
                onClick={() => editReq("reject")}
                className="btn btn-circle btn-primary btn-xs tooltip flex items-center"
                data-tip="Na pewno chcesz odrzucić zapytanie?"
              >
                <FaX />
              </button>
            </>
          ) : null}
          <button
            onClick={() => editReq("delete")}
            className="btn btn-circle btn-warning btn-xs tooltip flex items-center"
            data-tip="Na pewno chcesz usunąć zapytanie?"
          >
            <FaTrash />
          </button>
        </div>
        {req.status}
        {icons[req.status] || <FaCheckCircle />}
      </div>
    </div>
  );
};
