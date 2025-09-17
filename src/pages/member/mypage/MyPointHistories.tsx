import React, { useState } from "react";
import { History } from "lucide-react";

type MockItem = {
  id: string;
  type: "charge" | "use";
  amount: number;
  description: string;
  status: "completed";
  date: string;
  time: string;
  paymentMethod: string;
  orderId: string;
};

const mockPointHistory: MockItem[] = [
  {
    id: "1",
    type: "charge",
    amount: 30000,
    description: "포인트 충전",
    status: "completed",
    date: "2024-01-15",
    time: "14:30",
    paymentMethod: "토스",
    orderId: "ORD-2024-001",
  },
  {
    id: "2",
    type: "use",
    amount: -15000,
    description: "공연 예매",
    status: "completed",
    date: "2024-01-14",
    time: "16:45",
    paymentMethod: "포인트 사용",
    orderId: "ORD-2024-002",
  },
  {
    id: "3",
    type: "charge",
    amount: 50000,
    description: "포인트 충전",
    status: "completed",
    date: "2024-01-12",
    time: "09:20",
    paymentMethod: "토스",
    orderId: "ORD-2024-003",
  },
  {
    id: "4",
    type: "use",
    amount: -8000,
    description: "이벤트 응모",
    status: "completed",
    date: "2024-01-10",
    time: "11:15",
    paymentMethod: "포인트 사용",
    orderId: "ORD-2024-004",
  },
  {
    id: "5",
    type: "charge",
    amount: 20000,
    description: "포인트 충전",
    status: "completed",
    date: "2024-01-08",
    time: "13:25",
    paymentMethod: "토스",
    orderId: "ORD-2024-005",
  },
];

const PointHistoryPage: React.FC = () => {
  const [filterType, setFilterType] = useState<"all" | "charge" | "use">("all");

  const filteredHistory = mockPointHistory.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  return (
    <main className="flex-1 p-8 overflow-y-auto max-[1024px]:p-6 max-[768px]:p-4 max-[480px]:p-3">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200
                      max-[1024px]:flex-col max-[1024px]:items-start max-[1024px]:gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <History size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-gray-800 m-0">
                포인트 내역
              </h1>
              <p className="text-sm text-gray-500 m-0">
                포인트 충전 및 사용 내역을 확인하세요
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center w-auto max-[1024px]:w-full">
          <div className="flex items-center gap-3 w-full">
            <label className="text-sm font-medium text-gray-500">필터</label>
            <select
              className="min-w-[120px] w-auto px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700
                         focus:outline-none focus:border-blue-500 max-[1024px]:w-full"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "charge" | "use")
              }
            >
              <option value="all">전체 내역</option>
              <option value="charge">충전 내역</option>
              <option value="use">사용 내역</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden max-w-[1400px] mx-auto">
        {/* Header row */}
        <div
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200
                        text-gray-700 font-semibold text-sm"
        >
          <div>상태/내용</div>
          <div>충전 일시</div>
          <div>충전 금액</div>
          <div>충전 수단</div>
        </div>

        {/* Body */}
        <div className="flex flex-col">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-gray-100 items-center
                         hover:bg-gray-50 last:border-b-0"
            >
              {/* 상태/내용 */}
              <div className="flex flex-col gap-2">
                <span
                  className={[
                    "inline-block px-3 py-1 rounded-2xl text-xs font-bold w-fit",
                    item.type === "charge"
                      ? "bg-amber-100 text-amber-800" // pending
                      : "bg-blue-100 text-blue-700", // completed
                  ].join(" ")}
                >
                  {item.type === "charge" ? "입금 대기" : "결제 완료"}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {item.description}
                </span>
              </div>

              {/* 일시 */}
              <div className="text-sm text-gray-500">
                {item.date} {item.time}
              </div>

              {/* 금액 */}
              <div className="text-sm font-semibold text-gray-800">
                {item.amount.toLocaleString()}원
              </div>

              {/* 수단 */}
              <div className="text-sm text-gray-500">{item.paymentMethod}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default PointHistoryPage;
