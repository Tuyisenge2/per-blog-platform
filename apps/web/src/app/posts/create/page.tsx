"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
//import { getAllCategories } from "@/actions/categories";
//import { addPost } from "@/actions/posts";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { useCloudinary } from "@/hooks/useCloudinary";
import useToast from "@/hooks/useToast";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

interface User {
	id: number;
	email: string;
	name?: string;
	// Add other user properties as needed
}

const AddPost = () => {
	const { showSuccess, showError } = useToast();
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [categories, setCategories] = useState<{ id: number; name: string }[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const {
		uploadImage,
		loading: uploadLoading,
		error: uploadError,
	} = useCloudinary();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const addPostMutation = useMutation(
		orpc.addPost.mutationOptions({
			onSuccess: () => {
				showSuccess("Post created successfully!"); // ✅ Show toast first
				toast.success("Post created successfully!");

				setTimeout(() => router.push("/posts"), 100); // ✅ Let it render
				toast.success("Post created successfully!");

				//      router.push("/posts");
			},
			onError: (error) => {
				console.error("Post creation failed:", error);
				showError("Failed to create post.");
			},
		}),
	);

	const {
		data: categoriesData,
		isLoading: catLoader,
		error: categoryError,
	} = useQuery(orpc.getAllCategories.queryOptions());

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

	console.log(
		"categoriesDataDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
		categoriesData,
	);
	// Get user from localStorage and redirect if not logged in
	// useEffect(() => {
	//   const userData = localStorage.getItem("user");
	//   if (userData) {
	//     const user = JSON.parse(userData);
	//     setCurrentUser(user);
	//   } else {
	//     // Redirect to login if no user found
	//     router.push("/login");
	//     return;
	//   }
	// }, [router]);

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				//   const { data: posts, isLoading, error } = useQuery(orpc.getAllpost.queryOptions());
				const categoriesData = [] as any;
				setCategories(categoriesData);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			} finally {
				setLoading(false);
			}
		};
		// Only fetch categories if user is authenticated
		if (currentUser) {
			fetchCategories();
		}
	}, [currentUser]);

	const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedImage(file);
		// Create preview URL
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const removeSelectedImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleAdd = async () => {
		// if (!title.trim() || !content.trim() || !currentUser?.id) return;

		setSubmitting(true);
		try {
			let imageUrl = null;

			// Upload image if one was selected
			if (selectedImage) {
				imageUrl = await uploadImage(selectedImage);
			}

			// Create the post with the image URL and author ID
			addPostMutation.mutate({
				title,
				content,
				categoryId: categoryId || undefined,
				authorId: "lBZVYuBa0vooER30Q2LO4OLD60M1dnVI", // Replace with currentUser?.id
				image_url: imageUrl ?? "no image",
			});
			// const r = useQuery(
			//   orpc.addPost.queryOptions({
			//     input: {
			//       title: title,
			//       content: content,
			//       categoryId: 1,
			//       authorId: "lBZVYuBa0vooER30Q2LO4OLD60M1dnVI",
			//       imageUrl: 'no image',
			//     } as any,
			//   })
			// );
			//  await addPost(title, content, categoryId, currentUser.id, imageUrl);
			router.push("/posts");
			toast.success("Post created successfully!");
		} catch (error) {
			console.error("Failed to create post:", error);
		} finally {
			setSubmitting(false);
		}
	};

	// Show loading while checking authentication or fetching data
	// if (loading || !currentUser) {
	//   return (
	//     <div className='flex justify-center items-center min-h-[200px]'>
	//       <ClipLoader color='#3B82F6' size={40} />
	//     </div>
	//   );
	// }
	if (isPending || (!isPending && !session)) {
		// Show loader while checking or redirecting
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
			</div>
		);
	}

	return (
		<div className="flex justify-center p-4">
			<div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 shadow-sm">
				<h2 className="text-2xl font-bold mb-6 text-center">Create New Post</h2>

				{/* Display current user info */}
				<div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
					<p className="text-sm text-blue-800">
						<span className="font-medium">Author:</span>{" "}
						{/* {currentUser.name || currentUser.email} */}
					</p>
				</div>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Title
						</label>
						<input
							id="title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Post title"
							className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={submitting}
						/>
					</div>

					<div>
						<label
							htmlFor="content"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Content
						</label>
						<textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Post content"
							className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
							disabled={submitting}
						/>
					</div>

					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Category
						</label>
						<select
							id="category"
							value={categoryId || ""}
							onChange={(e) => setCategoryId(Number(e.target.value) || null)}
							className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={submitting}
						>
							<option value="">Select a category</option>
							{categoriesData &&
								categoriesData.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
						</select>
					</div>

					<div>
						<label
							htmlFor="image"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Featured Image
						</label>

						{imagePreview ? (
							<div className="relative group">
								<div className="relative h-64 w-full rounded-lg overflow-hidden mb-2 border border-gray-300">
									<Image
										src={imagePreview}
										alt="Selected preview"
										fill
										className="object-cover"
									/>
								</div>
								<button
									type="button"
									onClick={removeSelectedImage}
									className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
									disabled={submitting}
								>
									{" "}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-red-600"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<title>wre</title>
										<path
											fillRule="evenodd"
											d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>
						) : (
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
								<label className="cursor-pointer">
									<div className="flex flex-col items-center justify-center gap-2">
										<svg
											className="w-12 h-12 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
																				<title>wre</title>
	<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<span className="text-sm text-gray-600">
											Click to select an image
										</span>
										<input
											id="image"
											type="file"
											accept="image/*"
											onChange={handleImageSelection}
											className="hidden"
											ref={fileInputRef}
											disabled={submitting}
										/>
									</div>
								</label>
							</div>
						)}
					</div>

					<div className="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
							disabled={submitting}
						>
							Cancel
						</button>
						<button
							onClick={handleAdd}
							disabled={
								!title.trim() || !content.trim() || submitting
								//     !currentUser?.id
							}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[100px]"
						>
							{submitting ? (
								<ClipLoader color="#ffffff" size={20} />
							) : (
								"Create Post"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddPost;
