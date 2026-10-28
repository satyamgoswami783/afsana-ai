-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 15, 2026 at 02:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `afsana-db-6-june`
--

-- --------------------------------------------------------

--
-- Table structure for table `counselors`
--

CREATE TABLE `counselors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `university_id` int(11) DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_assigned_at` datetime DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `counselors`
--

INSERT INTO `counselors` (`id`, `user_id`, `phone`, `university_id`, `status`, `created_at`, `updated_at`, `last_assigned_at`, `country`, `branch`) VALUES
(21, 1, '04545454555', 20, 'active', '2025-07-12 14:39:53', '2026-06-06 15:44:11', '2026-06-06 15:44:11', NULL, NULL),
(38, 1, '8801898383124', 64, 'active', '2025-10-18 08:13:12', '2026-06-06 15:36:20', '2026-06-06 15:26:45', NULL, NULL),
(39, 1, '01886144158', 23, 'active', '2025-10-19 04:31:56', '2026-06-06 16:06:40', '2026-06-06 16:06:40', NULL, NULL),
(40, 1, '01898833036', 22, 'active', '2025-10-19 04:34:46', '2026-06-06 17:36:59', '2026-06-06 17:36:59', NULL, NULL),
(41, 1, '01886144129', 24, 'active', '2025-10-19 04:36:34', '2026-06-11 16:52:35', '2026-06-11 16:52:35', NULL, NULL),
(42, 1, '01897588468', 67, 'active', '2025-10-19 04:38:42', '2026-04-26 04:22:44', NULL, NULL, NULL),
(43, 1, '01898383121', 63, 'active', '2025-10-19 04:40:33', '2026-04-25 23:06:38', NULL, NULL, NULL),
(45, 1, '01898833032', 65, 'active', '2025-10-19 04:43:52', '2026-04-25 23:07:15', NULL, NULL, NULL),
(46, 1, '01858462288', 64, 'active', '2025-10-19 04:46:01', '2026-04-25 23:08:01', NULL, NULL, NULL),
(48, 1, '01886144165', 68, 'active', '2025-11-09 06:43:20', '2026-04-29 05:44:44', NULL, NULL, NULL),
(51, 1, '1234567', 23, 'active', '2025-11-12 06:27:19', '2025-11-12 06:27:19', NULL, NULL, NULL),
(54, 1, '01858-462281	', 23, 'active', '2025-11-15 09:57:03', '2025-11-15 09:57:03', NULL, NULL, NULL),
(55, 1, '01568406769', 24, 'active', '2025-11-22 11:18:09', '2026-04-25 23:08:42', NULL, NULL, NULL),
(56, 1, '00351927049187', 64, 'active', '2025-12-01 14:01:38', '2026-04-26 04:59:41', NULL, NULL, NULL),
(57, 1, '1234567987', 65, 'active', '2026-04-02 10:59:39', '2026-04-02 10:59:39', NULL, NULL, NULL),
(62, 1, '989898738273', 23, 'active', '2026-04-25 10:20:16', '2026-04-25 10:20:16', NULL, NULL, NULL),
(63, 1, '+880 1886-144129', 64, 'active', '2026-04-25 23:31:53', '2026-04-25 23:31:53', NULL, NULL, NULL),
(64, 1, '+880 1806971442', 24, 'active', '2026-04-25 23:34:13', '2026-04-25 23:34:13', NULL, NULL, NULL),
(65, 1, '+880 1898383123', 64, 'active', '2026-04-25 23:36:23', '2026-04-25 23:36:23', NULL, NULL, NULL),
(66, 1, '12346579', 71, 'active', '2026-05-05 10:07:49', '2026-05-05 10:07:49', NULL, NULL, NULL),
(67, 1, '123456788', 71, 'active', '2026-05-23 12:22:54', '2026-06-06 15:22:21', '2026-06-06 15:22:21', NULL, NULL),
(68, 1, ' 77459 21177', 72, 'active', '2026-06-06 15:40:17', '2026-06-06 15:40:17', NULL, NULL, NULL),
(69, 1, '1324567897', NULL, 'active', '2026-06-22 11:57:59', '2026-06-22 11:58:45', NULL, 'South Korea', 'Dhaka');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `counselors`
--
ALTER TABLE `counselors`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `counselors`
--
ALTER TABLE `counselors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
