"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
// import { getAllCategories } from "@/actions/categories";
// import { getPost, updatePost } from "@/actions/posts";
import { ClipLoader } from "react-spinners";
import { useCloudinary } from "@/hooks/useCloudinary";
import useToast from "@/hooks/useToast";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [categories, setCategories] = useState<{ id: number; name: string }[]>(
		[],
	);
	const { showSuccess, showError } = useToast();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
	const {
		uploadImage,
		loading: uploadLoading,
		error: uploadError,
	} = useCloudinary();
	const postId = Number(params.id);

	const {
		data: categoriesData,
		isLoading: catLoader,
		error: categoryError,
	} = useQuery(orpc.getAllCategories.queryOptions());

	const {
		data: postData,
		isLoading: postLoader,
		error: postError,
	} = useQuery(orpc.getPost.queryOptions({ input: { id: postId } }));

	const updatePostMutation = useMutation(
		orpc.editPost.mutationOptions(
			{
			onSuccess: () => {
				router.push("/posts");
			},
			onError: (error) => {
				console.error("Post creation failed:", error);
			},
		}
	),
	);

	console.log(
		"postDatAAAAAAAAAAAAAAAAQQQQQQQQQQQQQQQQQQQQQQQQQQQa",
		postData?.title,
		"categoriesData",
		categoriesData,
	);
	const { data: session, isPending } = authClient.useSession();
	const privateData = useQuery(orpc.privateData.queryOptions());

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

	useEffect(() => {
		if (postData) {
			setTitle(postData.title || "");
			setContent(postData.content || "");
			setCategoryId(postData.category_id ?? null);
			setImageUrl(postData.image_url || null);
			setOriginalImageUrl(postData.image_url || null);
			setLoading(false);
		}
	}, [postData]);

	useEffect(() => {
		if (categoriesData) {
			setCategories(categoriesData);
		}
	}, [categoriesData]);

	if (isPending || (!isPending && !session)) {
		// Show loader while checking or redirecting
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
			</div>
		);
	}

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const url = await uploadImage(file);
			setImageUrl(url);
		} catch (error) {
			console.error("Image upload failed:", error);
		}
	};

	const handleRemoveImage = () => {
		setImageUrl(null);
	};

	const handleRestoreOriginal = () => {
		setImageUrl(originalImageUrl);
	};

	const handleUpdate = async () => {
		if (!title.trim() || !content.trim()) return;
		setSubmitting(true);
		try {
			updatePostMutation.mutateAsync({
				id: postId,
				title,
				content,
				categoryId: categoryId as number,
				image_url: imageUrl || "",
			});
			// await updatePost(
			//   Number(params.id),
			//   title,
			//   content,
			//   categoryId,
			//   imageUrl as string// Include the image URL in the update
			// );
			toast.success("post updated successfully!");
			router.push("/posts");
			toast.success("post updated successfully!");
		} catch (error) {
			console.error("Failed to update post:", error);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading || !postData) {
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<ClipLoader color="#3B82F6" size={40} />
			</div>
		);
	}

	return (
		<div className="flex justify-center p-4">
			<div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 shadow-sm">
				<h2 className="text-2xl font-bold mb-6 text-center">Edit Post</h2>

				<div className="space-y-4">
					{/* Image Upload Section */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Featured Image
						</label>

						{imageUrl && imageUrl.startsWith("http") ? (
							<div className="relative group">
								<div className="relative h-64 w-full rounded-lg overflow-hidden mb-2">
									<Image
										src={imageUrl}
										alt="Post preview"
										fill
										className="object-cover"
									/>
								</div>
								<div className="absolute top-4 right-4 flex gap-2">
									<label className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer">
										<FiEdit2 className="text-gray-600" />
										<input
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
									</label>
									<button
										onClick={handleRemoveImage}
										className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
									>
										<FiTrash2 className="text-red-600" />
									</button>
								</div>
								{imageUrl !== originalImageUrl && (
									<button
										onClick={handleRestoreOriginal}
										className="mt-2 text-sm text-blue-600 hover:text-blue-800"
									>
										Restore original image
									</button>
								)}
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
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<span className="text-sm text-gray-600">
											{uploadLoading
												? "Uploading..."
												: "Click to upload an image"}
										</span>
										<input
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
									</div>
								</label>
							</div>
						)}
						{uploadError && (
							<p className="mt-2 text-sm text-red-600">{uploadError}</p>
						)}
					</div>

					{/* Title Input */}
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
						/>
					</div>

					{/* Content Input */}
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
						/>
					</div>

					{/* Category Select */}
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
						>
							<option value="">Select a category</option>
							{categories &&
								categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
						</select>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
						>
							Cancel
						</button>
						<button
							onClick={handleUpdate}
							disabled={
								!title.trim() || !content.trim() || submitting || uploadLoading
							}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[100px]"
						>
							{submitting ? (
								<ClipLoader color="#ffffff" size={20} />
							) : (
								"Update Post"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { getAllCategories } from "@/actions/categories";
// import { getPost, updatePost } from "@/actions/posts";
// import { ClipLoader } from "react-spinners";

// export default function EditPostPage() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [categoryId, setCategoryId] = useState<number | null>(null);
//   const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const postId = Number(params.id);

//         const [postData, categoriesData] = await Promise.all([
//           getPost(postId),
//           getAllCategories(),
//         ]);

//         setTitle(postData.title);
//         setContent(postData.content);
//         setCategoryId(postData.category_id);
//         setCategories(categoriesData);
//       } catch (error) {
//         console.error("Failed to fetch data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params.id]);

//   const handleUpdate = async () => {
//     if (!title.trim() || !content.trim()) return;
//     setSubmitting(true);
//     try {
//       await updatePost(Number(params.id), title, content, categoryId);
//       router.push("/posts");
//     } catch (error) {
//       console.error("Failed to update post:", error);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[200px]">
//         <ClipLoader color="#3B82F6" size={40} />
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-center p-4">
//       <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 shadow-sm">
//         <h2 className="text-2xl font-bold mb-6 text-center">Edit Post</h2>

//         <div className="space-y-4">
//           <div>
//             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
//               Title
//             </label>
//             <input
//               id="title"
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Post title"
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
//               Content
//             </label>
//             <textarea
//               id="content"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="Post content"
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
//             />
//           </div>

//           <div>
//             <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//               Category
//             </label>
//             <select
//               id="category"
//               value={categoryId || ""}
//               onChange={(e) => setCategoryId(Number(e.target.value) || null)}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select a category</option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               disabled={!title.trim() || !content.trim() || submitting}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[100px]"
//             >
//               {submitting ? (
//                 <ClipLoader color="#ffffff" size={20} />
//               ) : (
//                 "Update Post"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
