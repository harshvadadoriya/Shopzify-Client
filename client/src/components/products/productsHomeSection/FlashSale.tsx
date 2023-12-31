import {
	Badge,
	Box,
	Button,
	Flex,
	Text,
	Image,
	useColorModeValue,
	useToast,
} from '@chakra-ui/react';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { sliderSettings } from '../../../utils/sliderSettings';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import 'swiper/css';
import { ProductFormValues } from '../../../interfaces/interface';
import {
	useGetProductDataQuery,
	useGetWishlistsQuery,
} from '../../../redux/apiSliceRedux/apiSlice';
import TextTransition from '../utils/TextTransition';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import '../utils/WishlistHeartAnimation.css';
import { useAddToWishlistMutation } from '../../../redux/apiSliceRedux/apiSlice';
import { getBadgeColor } from '../../../constants/BadgeColor';
import ProductsSkeleton from './skeleton/ProductsSkeleton';
import { calculateSavingsPercentage } from '../../customComp/CalculateSavingsPercentage';

const SliderButtons = () => {
	const swiper = useSwiper();
	return (
		<Flex position="absolute" top="4" right="0" zIndex={1}>
			<Button onClick={() => swiper.slidePrev()}>
				<FiChevronLeft />
			</Button>
			<Button onClick={() => swiper.slideNext()} ml="2">
				<FiChevronRight />
			</Button>
		</Flex>
	);
};

const FlashSale = () => {
	const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
	const cardBgColor = useColorModeValue('white', 'gray.700');
	const priceTextColor = useColorModeValue('gray.600', 'gray.400');
	const dummyPriceTextColor = useColorModeValue('gray.400', 'gray.500');
	const toast = useToast();
	const navigate = useNavigate();

	const { data: productData, isLoading, isError } = useGetProductDataQuery();
	const { data: wishlistData } = useGetWishlistsQuery();
	const [wishlistItems, setWishlistItems] = useState<ProductFormValues[]>([]);

	const TopPicksProducts = productData?.productDetails.filter(
		(product) => product.badge === 'sale' && product.status === true
	);

	const [addToWishlist, { isLoading: isAddingToWishlist }] =
		useAddToWishlistMutation();

	const handleToggleWishlist = (product: ProductFormValues) => {
		const updatedWishlistItems = wishlistItems.some(
			(item) => item._id === product._id
		)
			? wishlistItems.filter((item) => item._id !== product._id)
			: [...wishlistItems, product];

		setWishlistItems(updatedWishlistItems);

		addToWishlist({ product })
			.unwrap()
			.then((response: any) => {
				const message = response?.message || 'Something went wrong';
				toast({
					title: message,
					status: 'success',
					position: 'top',
					duration: 2000,
					isClosable: true,
				});
			})
			.catch((error) => {
				toast({
					title: error.data.message,
					description: error.data.subMessage,
					status: 'error',
					position: 'top',
					duration: 2000,
					isClosable: true,
				});
			});
	};

	const handleProductClick = (product: ProductFormValues) => {
		navigate(`/products/${product._id}`, { state: { product } });
	};

	useEffect(() => {
		if (wishlistData) {
			setWishlistItems(wishlistData.wishlist.products);
		}
	}, [wishlistData]);

	if (isLoading) {
		return <ProductsSkeleton />;
	}

	if (isError) {
		return <Box marginX={4}>Error fetching products</Box>;
	}

	return (
		<>
			<Box marginX={4} position="relative">
				<TextTransition text="FLASH SALE" />
				<center>
					<Swiper {...sliderSettings}>
						<SliderButtons />
						{TopPicksProducts?.map((obj: ProductFormValues) => {
							const isWishlisted =
								wishlistData &&
								wishlistData.wishlist.products.some(
									(item) => item.productId === obj._id
								);
							const savingsPercentage = calculateSavingsPercentage(
								obj.originalPrice,
								obj.discountedPrice
							);
							const badgeColor = getBadgeColor(obj.badge);
							return (
								<SwiperSlide key={obj._id}>
									<Box
										key={obj._id}
										className="relative max-w-md rounded-3xl p-2 mt-[5rem]"
										border={1}
										borderStyle="solid"
										bgColor={cardBgColor}
										borderColor={cardBorderColor}
									>
										<div
											className="overflow-x-hidden rounded-2xl relative cursor-pointer"
											style={{ userSelect: 'none' }}
											onClick={() => handleProductClick(obj)}
										>
											<Image
												className="h-[15rem] rounded-2xl w-full object-cover"
												loading="lazy"
												src={obj.image}
											/>
											<Box className="absolute left-2 top-1 rounded-full">
												<Box className="absolute  left-[-0.5rem] top-[-0.3rem] px-2 py-1 w-max rounded-tl-2xl bg-teal-500 text-white text-sm">
													<Text
														mt={'0.2rem'}
													>{`${savingsPercentage}% Off`}</Text>
												</Box>
											</Box>
										</div>
										<div className="mt-4 pl-2 mb-2 flex justify-between">
											<div>
												<p
													className="text-lg font-semibold text-teal-500 mb-0 text-left"
													style={{ userSelect: 'none' }}
												>
													{obj.name}
												</p>
												<div
													className="flex items-center"
													style={{ userSelect: 'none' }}
												>
													<Text className="text-lg mt-0" color={priceTextColor}>
														Rs. {Number(obj.discountedPrice).toLocaleString()}
													</Text>
													<Text
														className="text-md mt-0 ml-2 line-through"
														color={dummyPriceTextColor}
													>
														Rs. {Number(obj.originalPrice).toLocaleString()}
													</Text>
												</div>
											</div>
											<Flex
												onClick={() => handleToggleWishlist(obj)}
												className={`heart-button flex flex-col-reverse mt-[1.8rem] mr-4 group cursor-pointer h-5 ${
													isWishlisted ? 'is-active' : ''
												}`}
											>
												{isWishlisted ? (
													<FaHeart
														className="text-teal-600"
														fontSize={'20px'}
													/>
												) : (
													<FaRegHeart fontSize={'20px'} fill="gray" />
												)}
											</Flex>
										</div>
									</Box>
								</SwiperSlide>
							);
						})}
					</Swiper>
				</center>
			</Box>
		</>
	);
};

export default FlashSale;
