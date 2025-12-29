import { useState } from "react";
import { BASE_URL, getAuthHeaders } from "../../../Redux/config";

function SubscriptionModal({ onClose, imageSrc }) {
  const [selected, setSelected] = useState("quarterly");

  const plans = [
    {
      id: "free",
      title: "Free",
      price: "₦00.00",
      subtitle: "Limited",
      badgeType: "muted",
    },
    {
      id: "quarterly",
      title: "Quarterly",
      price: "₦12,000",
      subtitle: "(₦3,000/mo)",
      badgeType: "primary",
      badgeText: "32% off",
    },
    {
      id: "monthly",
      title: "Monthly",
      price: "₦5,000",
      subtitle: "",
      badgeType: "muted",
      badgeText: "10% off",
    },
  ];

  const imgSrc = imageSrc || "/subscription.svg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[720px] max-w-full p-8 relative">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-40 h-40 mb-6 flex items-center justify-center">
            <img
              src={imgSrc}
              alt="subscription"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Subscribe to have unlimited <br></br> access to Care Provider
          </h2>

          <div className="mt-6 w-full grid grid-cols-3 gap-4">
            {plans.map((p) => {
              const isSelected = selected === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={
                    `cursor-pointer rounded-lg p-6 flex flex-col items-center justify-between border transition ` +
                    (isSelected
                      ? "bg-[#0aa0d6] text-white border-transparent shadow-lg"
                      : "bg-white text-gray-800 border border-gray-100 hover:shadow")
                  }
                >
                  <div className="text-sm font-medium mb-2">{p.title}</div>
                  <div className="text-3xl font-bold mb-1">{p.price}</div>
                  <div
                    className={`text-sm ${
                      isSelected ? "opacity-80" : "text-gray-500"
                    }`}
                  >
                    {p.subtitle}
                  </div>

                  <div className="mt-4">
                    <div
                      className={
                        `px-3 py-1 rounded-md text-sm font-medium inline-block ` +
                        (p.badgeType === "primary"
                          ? isSelected
                            ? "bg-white text-[#0aa0d6]"
                            : "bg-[#e6f7fb] text-[#0aa0d6]"
                          : "bg-gray-100 text-gray-500")
                      }
                    >
                      {p.badgeText || p.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 w-full flex justify-center">
            <button
              onClick={async () => {
                // Free plan: just close
                if (selected === "free") {
                  onClose && onClose();
                  return;
                }

                // Map plan to plan_id
                const planMap = { quarterly: 1, monthly: 2 };
                const plan_id = planMap[selected] || 0;
                if (!plan_id) {
                  alert("Invalid plan selected");
                  return;
                }

                try {
                  // Show a simple loading feedback via changing button text
                  // Make the POST request to checkout endpoint
                  const res = await fetch(
                    `${BASE_URL}/api/payments/checkout/`,
                    {
                      method: "POST",
                      headers: {
                        ...(getAuthHeaders ? getAuthHeaders() : {}),
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        plan_id,
                        payment_gateway: "stripe",
                      }),
                    }
                  );

                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    const err =
                      data?.detail || data?.message || "Checkout failed";
                    alert(err);
                    return;
                  }

                  const checkoutUrl =
                    data.checkout_url || data.url || data.checkout_url;
                  if (checkoutUrl) {
                    // open in new tab
                    window.open(checkoutUrl, "_blank");
                    onClose && onClose();
                  } else {
                    alert("Checkout URL not returned by server");
                  }
                } catch (err) {
                  console.error("Checkout error:", err);
                  alert("Checkout failed. Please try again.");
                }
              }}
              className="bg-[#0093d1] hover:bg-[#007bb0] text-white font-medium py-3 px-8 rounded-md"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionModal;
