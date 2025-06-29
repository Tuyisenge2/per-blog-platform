import toast from "react-hot-toast";

const useToast = () => {
	const showSuccess = (message: string) => {
		toast.success(message, {
			duration: 4000,
			position: "top-right",
			style: {
				background: "#4CAF50",
				color: "#fff",
			},
		});
	};

	const showError = (message: string) => {
		toast.error(message, {
			duration: 4000,
			position: "top-right",
			style: {
				background: "#f44336",
				color: "#fff",
			},
		});
	};

	const showWarning = (message: string) => {
		toast(message, {
			duration: 4000,
			position: "top-right",
			style: {
				background: "#ff9800",
				color: "#fff",
			},
		});
	};

	return {
		showSuccess,
		showError,
		showWarning,
	};
};

export default useToast;
