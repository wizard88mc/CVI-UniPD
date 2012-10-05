-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 05, 2012 at 02:28 PM
-- Server version: 5.5.24-log
-- PHP Version: 5.3.13

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `cvi_database`
--
CREATE DATABASE `cvi_database` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `cvi_database`;

-- --------------------------------------------------------

--
-- Table structure for table `CatchMeEvaluation`
--

DROP TABLE IF EXISTS `CatchMeEvaluation`;
CREATE TABLE IF NOT EXISTS `CatchMeEvaluation` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `IDVisit` int(11) NOT NULL,
  `TouchEvaluation` float DEFAULT NULL,
  `EyeEvaluation` float DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `IDVisit` (`IDVisit`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=312 ;

--
-- Dumping data for table `CatchMeEvaluation`
--

INSERT INTO `CatchMeEvaluation` (`ID`, `IDVisit`, `TouchEvaluation`, `EyeEvaluation`) VALUES
(1, 2, 45, 70),
(2, 4, 30, 50),
(3, 103, 0, 0),
(4, 104, 0, 0),
(5, 116, 0, 0),
(6, 120, 0, 2.01),
(7, 132, 0, 0),
(8, 133, 0, 0),
(9, 134, 0, 0),
(10, 135, 0, 0),
(11, 136, 0, 0),
(12, 138, 0, 0),
(13, 139, 0, 0),
(14, 140, 0, 0),
(15, 145, 0, 0),
(16, 164, 0, 0),
(17, 166, 3.68, 0),
(18, 167, 6.36, 6.36),
(20, 168, 2.78, 6.35),
(218, 169, 0, 0),
(219, 171, 2.27, 5),
(220, 172, 0, 0),
(221, 173, 0, 0),
(222, 198, 0, 0),
(223, 199, 0, 0),
(224, 217, 4.63, 0),
(225, 226, 30.34, 2.96),
(226, 233, 6.47, 0),
(227, 235, 0, 0),
(228, 237, 1.89, 2.83),
(229, 239, 0, 0),
(230, 243, 10.44, 0),
(231, 245, 6.95, 0),
(232, 247, 0, 0),
(233, 249, 4.89, 0),
(234, 251, 5.08, 3.28),
(235, 253, 6.2, 2.07),
(236, 255, 9.32, 0),
(237, 287, 15.94, 0),
(238, 289, 11.2, 3.69),
(239, 292, 5.5, 16.82),
(240, 294, 1.49, 6.65),
(241, 297, 0.31, 5.53),
(242, 300, 0, 0),
(243, 316, 3.63, 0),
(244, 341, 0, 0),
(305, 344, 36.39, 0),
(306, 345, 36.39, 0),
(307, 346, 36.39, 0),
(308, 347, 23.53, 0),
(309, 348, 7.28, 0),
(310, 350, 7.28, 0),
(311, 351, 23.53, 0);

-- --------------------------------------------------------

--
-- Table structure for table `CatchMeExercises`
--

DROP TABLE IF EXISTS `CatchMeExercises`;
CREATE TABLE IF NOT EXISTS `CatchMeExercises` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DefaultGravity` enum('L','M','H') COLLATE utf8_unicode_ci DEFAULT NULL,
  `IDPatient` int(11) DEFAULT NULL,
  `Movements` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `StartFromCenter` tinyint(1) NOT NULL DEFAULT '0',
  `MixMovements` tinyint(1) NOT NULL DEFAULT '0',
  `Speed` int(11) DEFAULT NULL,
  `BackgroundColor` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ImageColor` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ChangeImageColor` tinyint(1) DEFAULT NULL,
  `ImageID` int(11) DEFAULT NULL,
  `ImageWidth` int(11) DEFAULT NULL,
  `CurrentValidSettings` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=24 ;

--
-- Dumping data for table `CatchMeExercises`
--

INSERT INTO `CatchMeExercises` (`ID`, `DefaultGravity`, `IDPatient`, `Movements`, `StartFromCenter`, `MixMovements`, `Speed`, `BackgroundColor`, `ImageColor`, `ChangeImageColor`, `ImageID`, `ImageWidth`, `CurrentValidSettings`) VALUES
(1, 'M', NULL, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 10, NULL),
(2, 'H', NULL, 'L', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 10, NULL),
(12, NULL, 1, 'L;R;B', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 10, 0),
(13, NULL, 1, 'L;R;T;B', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 10, 0),
(14, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 17, 0),
(15, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 21, 0),
(16, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 17, 0),
(17, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 22, 0),
(18, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 23, 0),
(19, NULL, 1, 'L;R;B', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 10, 0),
(20, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 19, 0),
(21, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 3, 21, 0),
(22, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 1, 21, 0),
(23, NULL, 1, 'L;R', 0, 0, 5, '#FF0000', '#FFFF00', 0, 3, 21, 1);

-- --------------------------------------------------------

--
-- Table structure for table `Doctors`
--

DROP TABLE IF EXISTS `Doctors`;
CREATE TABLE IF NOT EXISTS `Doctors` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Surname` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Username` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Password` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `Doctors`
--

INSERT INTO `Doctors` (`ID`, `Name`, `Surname`, `Email`, `Username`, `Password`) VALUES
(1, 'Matteo', 'Ciman', NULL, 'dottore', '4a087bb3d759f8a24ab011f27a2a3a3f');

-- --------------------------------------------------------

--
-- Table structure for table `Exercises`
--

DROP TABLE IF EXISTS `Exercises`;
CREATE TABLE IF NOT EXISTS `Exercises` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `IDGame` int(11) NOT NULL,
  `DefaultGravity` enum('L','M','H') COLLATE utf8_unicode_ci DEFAULT NULL,
  `IDPatient` int(11) DEFAULT NULL,
  `Movement` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Speed` int(11) DEFAULT NULL,
  `BackgroundColor` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `ImageColor` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `ChangeImageColor` tinyint(1) DEFAULT NULL,
  `ImageID` int(11) DEFAULT NULL,
  `ImageWidth` int(11) DEFAULT NULL,
  `LevelHelpMe` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CurrentValidSettings` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Exercises`
--

INSERT INTO `Exercises` (`ID`, `IDGame`, `DefaultGravity`, `IDPatient`, `Movement`, `Speed`, `BackgroundColor`, `ImageColor`, `ChangeImageColor`, `ImageID`, `ImageWidth`, `LevelHelpMe`, `CurrentValidSettings`) VALUES
(1, 1, 'M', NULL, 'L;R', 5, '#FF0000', '#FFFF00', 0, 1, 10, 'levels.xml', 0),
(2, 1, 'H', NULL, 'L', 5, '#FF0000', '#FFFFFF', 0, 1, 10, 'levels.xml', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Games`
--

DROP TABLE IF EXISTS `Games`;
CREATE TABLE IF NOT EXISTS `Games` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `Folder` varchar(500) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Cartella dove è installato il gioco',
  `Description` varchar(500) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Breve descrizione del gioco',
  `Identification` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Elenco dei giochi installati con relativa descrizione' AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Games`
--

INSERT INTO `Games` (`ID`, `Name`, `Folder`, `Description`, `Identification`) VALUES
(1, 'Prendimi!', 'catchMe', 'L''immagine si muove, bisogna seguirla con il dito e con lo sguardo.', 'CATCH_ME'),
(2, 'Aiutami!', 'helpMe', 'Aiuta il folletto di Babbo Natale a preparare il sacco con i regali giusti..', 'HELP_ME');

-- --------------------------------------------------------

--
-- Table structure for table `HelpMeEvaluation`
--

DROP TABLE IF EXISTS `HelpMeEvaluation`;
CREATE TABLE IF NOT EXISTS `HelpMeEvaluation` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `IDVisit` int(11) NOT NULL,
  `FirstResponseTime` float DEFAULT NULL,
  `CompletionTime` float DEFAULT NULL,
  `CorrectAnswers` int(11) DEFAULT NULL,
  `WrongAnswers` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `IDVisit` (`IDVisit`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=31 ;

--
-- Dumping data for table `HelpMeEvaluation`
--

INSERT INTO `HelpMeEvaluation` (`ID`, `IDVisit`, `FirstResponseTime`, `CompletionTime`, `CorrectAnswers`, `WrongAnswers`) VALUES
(1, 1, 5000, 4000, 4, 3),
(2, 3, 3500, 7600, 3, 6),
(3, 21, 3088, 4176, 3, 1),
(6, 71, 1065, 1888, 0, 1),
(7, 72, 1065, 1888, 0, 1),
(8, 73, 1065, 1888, 0, 1),
(9, 74, 1065, 1888, 0, 1),
(10, 75, 1065, 1888, 0, 1),
(11, 76, 1065, 1888, 0, 1),
(12, 77, 1065, 1888, 0, 1),
(13, 78, 1065, 1888, 0, 1),
(14, 79, 1364, 2167, 0, 1),
(15, 80, 1364, 2167, 0, 1),
(16, 81, 1364, 2167, 0, 1),
(17, 82, 534, 1099, 0, 1),
(18, 187, 4506, 5287, 4, 0),
(19, 188, 3597, 5405, 4, 0),
(20, 193, 1895, 4368, 4, 0),
(21, 206, 2275, 4274, 4, 0),
(22, 208, 1626, 4652, 4, 0),
(23, 210, 2172, 4960, 4, 0),
(24, 274, 4652, 5316, 1, 0),
(25, 275, 4087, 4739, 1, 0),
(26, 276, 3698, 4087, 1, 0),
(27, 277, 4502, 7036, 1, 0),
(28, 278, 4807, 7363, 1, 0),
(29, 301, 4294, 15929, 1, 0),
(30, 349, 771, 3285, 2, 0);

-- --------------------------------------------------------

--
-- Table structure for table `HelpMeExercises`
--

DROP TABLE IF EXISTS `HelpMeExercises`;
CREATE TABLE IF NOT EXISTS `HelpMeExercises` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DefaultGravity` enum('L','M','H') COLLATE utf8_unicode_ci DEFAULT NULL,
  `IDPatient` int(11) DEFAULT NULL,
  `FileLevels` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CurrentValidSettings` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Contiene i livelli assegnati a ciascun paziente' AUTO_INCREMENT=23 ;

--
-- Dumping data for table `HelpMeExercises`
--

INSERT INTO `HelpMeExercises` (`ID`, `DefaultGravity`, `IDPatient`, `FileLevels`, `CurrentValidSettings`) VALUES
(1, 'L', NULL, 'low.xml', NULL),
(2, 'M', NULL, 'medium.xml', NULL),
(3, 'H', NULL, 'high.xml', NULL),
(18, NULL, 1, '1/20120911-075034.xml', 0),
(20, NULL, 1, '1/20120911-075801.xml', 1),
(22, NULL, 1, '1/20120919-000101.xml', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Images`
--

DROP TABLE IF EXISTS `Images`;
CREATE TABLE IF NOT EXISTS `Images` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ImageName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `FileName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `CanvasRules` longtext COLLATE utf8_unicode_ci,
  `Dimensions` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=5 ;

--
-- Dumping data for table `Images`
--

INSERT INTO `Images` (`ID`, `ImageName`, `FileName`, `CanvasRules`, `Dimensions`) VALUES
(1, 'Bugs Bunny intero', 'bugs_bunny.png', NULL, '448x785'),
(2, 'Bugs Bunny 2', 'bugs_bunny1.svg', NULL, '300x400'),
(3, 'Faccia Paperino', 'paperino.png', NULL, '193x201'),
(4, 'Pluto lingua', 'pluto_lingua.png', NULL, '191x235');

-- --------------------------------------------------------

--
-- Table structure for table `MachinesOffset`
--

DROP TABLE IF EXISTS `MachinesOffset`;
CREATE TABLE IF NOT EXISTS `MachinesOffset` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Offset` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `DateOffsetCalculation` date NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Contiene tutti i valori di offset calcolati per le macchine utilizzate' AUTO_INCREMENT=133 ;

--
-- Dumping data for table `MachinesOffset`
--

INSERT INTO `MachinesOffset` (`ID`, `Offset`, `DateOffsetCalculation`) VALUES
(1, '0', '2012-06-25'),
(2, '0', '2012-06-25'),
(10, '1.0,-0.44499999999999995', '2012-08-27'),
(11, '1.024390243902439,-0.48', '2012-08-27'),
(12, '1.0172413793103448,-0.645', '2012-08-27'),
(13, '1.0,-0.6950000000000001', '2012-08-27'),
(14, '1.009009009009009,-0.71', '2012-08-27'),
(15, '1.0093457943925235,-0.71', '2012-08-27'),
(16, '1.009090909090909,-0.7', '2012-08-27'),
(17, '1.046728971962617,-4.645', '2012-08-27'),
(18, '1.0084745762711864,-0.7050000000000001', '2012-08-27'),
(19, '1.0490196078431373,-4.71', '2012-08-27'),
(20, '1.0091743119266054,-0.6950000000000001', '2012-08-27'),
(41, '1.00, -0.15', '2012-08-27'),
(42, '1.0,-0.71', '2012-08-27'),
(43, '1.0,-0.685', '2012-08-27'),
(44, '1.0092592592592593,-0.7150000000000001', '2012-08-27'),
(45, '1.009433962264151,-0.71', '2012-08-27'),
(46, '1.0087719298245614,-0.685', '2012-08-27'),
(47, '1.0096153846153846,-0.73', '2012-08-27'),
(48, '1.0085470085470085,-0.6699999999999999', '2012-08-27'),
(49, '1.0077519379844961,-0.53', '2012-08-27'),
(50, '1.0,-0.69', '2012-08-27'),
(51, '1.0,-0.685', '2012-08-27'),
(52, '1.0082644628099173,-0.7050000000000001', '2012-08-27'),
(53, '0.0,0.0', '2012-08-27'),
(54, '0.0,0.0', '2012-08-27'),
(55, '0.0,0.0', '2012-08-27'),
(56, '1.0,0.0', '2012-08-27'),
(57, '1.0,-1.0', '2012-08-27'),
(58, '1.0,-1.0', '2012-08-27'),
(59, '1.0,-1.0', '2012-08-27'),
(60, '1.0,-1.0', '2012-08-27'),
(61, '1.0,-1.0', '2012-08-28'),
(62, '1.0,-1.0', '2012-08-28'),
(63, '1.008695652173913,-0.74', '2012-08-28'),
(64, '1.0089285714285716,-0.69', '2012-08-28'),
(65, '0.001,-0.001', '2012-08-28'),
(66, '1.0096,-0.71', '2012-08-28'),
(67, '1.009,-0.74', '2012-08-28'),
(68, '1.01,-0.71', '2012-08-28'),
(69, '1.0,-0.7', '2012-08-28'),
(70, '1.0,-0.7', '2012-08-28'),
(71, '1.0,-0.7', '2012-08-28'),
(72, '1.0,-0.6', '2012-08-28'),
(73, '1.0,-0.1', '2012-09-13'),
(74, '1.0,-0.1', '2012-09-13'),
(75, '1.0,-0.1', '2012-09-13'),
(76, '1.0,-0.2', '2012-09-13'),
(77, '1.0,-1.0', '2012-09-13'),
(78, '1.0,-0.1', '2012-09-13'),
(79, '1.0,1.9', '2012-09-13'),
(80, '1.0,-0.0', '2012-09-13'),
(81, '1.0,-0.7', '2012-09-17'),
(82, '1.0,-0.7', '2012-09-17'),
(83, '1.0,-0.7', '2012-09-17'),
(84, '1.0,-0.7', '2012-09-17'),
(85, '1.0,-0.8', '2012-09-17'),
(86, '1.0,-0.8', '2012-09-17'),
(87, '1.0,-0.7', '2012-09-17'),
(88, '1.0,-0.8', '2012-09-17'),
(89, '1.0,-0.7', '2012-09-17'),
(90, '1.0,-0.8', '2012-09-17'),
(91, '1.0,-0.8', '2012-09-17'),
(92, '1.0,-0.7', '2012-09-17'),
(93, '1.0,-0.8', '2012-09-17'),
(94, '1.0,-0.7', '2012-09-17'),
(95, '1.0,-0.7', '2012-09-17'),
(96, '1.0,-0.7', '2012-09-18'),
(97, '1.0,-0.6', '2012-09-18'),
(98, '1.0,-0.7', '2012-09-18'),
(99, '1.0,-0.8', '2012-09-18'),
(100, '1.0,-0.7', '2012-09-19'),
(101, '1.0,-0.8', '2012-09-19'),
(102, '1.0,-0.7', '2012-09-19'),
(103, '1.0,-0.8', '2012-09-19'),
(104, '1.0,-0.7', '2012-09-19'),
(105, '1.0,-0.8', '2012-09-19'),
(106, '1.0,-0.8', '2012-09-19'),
(107, '1.0,-0.7', '2012-09-22'),
(108, '1.1,-15.8', '2012-09-23'),
(109, '1.0,-0.7', '2012-09-23'),
(110, '1.0,-0.7', '2012-09-23'),
(111, '1.0,-0.8', '2012-09-23'),
(112, '1.0,-0.8', '2012-09-23'),
(113, '1.0,-0.7', '2012-09-27'),
(114, '1.0,-1.0', '2012-09-27'),
(115, '1.0,-0.8', '2012-09-27'),
(116, '1.0,-0.5', '2012-09-27'),
(117, '1.0,-1.0', '2012-09-27'),
(118, '1.0,-1.0', '2012-09-27'),
(119, '1.0,-0.7', '2012-09-28'),
(120, '1.0,-0.7', '2012-09-28'),
(121, '1.0,-0.8', '2012-09-28'),
(122, '1.0,-0.7', '2012-09-28'),
(123, '1.0,-0.7', '2012-09-28'),
(124, '1.0,-0.7', '2012-09-28'),
(125, '1.0,-9.8', '2012-09-30'),
(126, '1.1,-14.8', '2012-09-30'),
(127, '1.1,-14.8', '2012-09-30'),
(128, '1.0,-0.7', '2012-09-30'),
(129, '1.0,-0.7', '2012-09-30'),
(130, '1.0,-0.7', '2012-09-30'),
(131, '1.0,0.7', '2012-10-01'),
(132, '1.0,-0.7', '2012-10-03');

-- --------------------------------------------------------

--
-- Table structure for table `Patients`
--

DROP TABLE IF EXISTS `Patients`;
CREATE TABLE IF NOT EXISTS `Patients` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DoctorID` int(11) NOT NULL,
  `Name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Surname` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Sex` enum('M','F') COLLATE utf8_unicode_ci DEFAULT 'M',
  `DateOfBirth` date DEFAULT NULL,
  `Gravity` enum('L','M','H') COLLATE utf8_unicode_ci DEFAULT 'M',
  `Username` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Password` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Name` (`Name`,`Surname`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=5 ;

--
-- Dumping data for table `Patients`
--

INSERT INTO `Patients` (`ID`, `DoctorID`, `Name`, `Surname`, `Sex`, `DateOfBirth`, `Gravity`, `Username`, `Password`) VALUES
(1, 1, 'Matteo', 'Ciman', 'M', NULL, 'M', NULL, NULL),
(2, 1, 'Mario', 'Rossi', 'M', NULL, 'M', NULL, NULL),
(3, 0, 'Pinco', 'Pallo', 'F', '2012-07-10', 'M', NULL, NULL),
(4, 1, 'Paperino', 'Paolino', 'M', '2012-09-03', 'M', 'paperino.paolino', '7f241383606400698f7d0dd533d7f02f');

-- --------------------------------------------------------

--
-- Table structure for table `Visits`
--

DROP TABLE IF EXISTS `Visits`;
CREATE TABLE IF NOT EXISTS `Visits` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Date` date NOT NULL,
  `IDPatient` int(11) NOT NULL,
  `IDGame` int(11) NOT NULL,
  `Folder` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `IsAtHome` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=352 ;

--
-- Dumping data for table `Visits`
--

INSERT INTO `Visits` (`ID`, `Date`, `IDPatient`, `IDGame`, `Folder`, `IsAtHome`) VALUES
(1, '2012-08-01', 1, 2, NULL, 0),
(2, '2012-08-01', 1, 1, 'archivio_visite/1/2012-7-20-18-24-10/', 0),
(3, '2012-08-01', 1, 2, NULL, 0),
(4, '2012-08-02', 1, 1, NULL, 0),
(16, '2012-08-01', 1, 2, 'archivio_visite/1/2012-8-1-23-57-16/', 0),
(17, '2012-08-01', 1, 2, NULL, 0),
(18, '2012-08-01', 1, 2, 'archivio_visite/1/2012-8-1-23-59-18/', 0),
(19, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-0-15-19/', 0),
(20, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-0-32-20/', 0),
(21, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-0-36-21/', 0),
(22, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-9-24-22/', 0),
(23, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-9-30-23/', 0),
(24, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-9-33-24/', 0),
(25, '2012-08-02', 1, 1, 'archivio_visite/1/2012-8-2-9-34-25/', 0),
(26, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-11-12-26/', 0),
(27, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-12-47-27/', 0),
(28, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-13-55-28/', 0),
(29, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-14-8-29/', 0),
(30, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-14-13-30/', 0),
(31, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-18-16-31/', 0),
(32, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-18-37-32/', 0),
(33, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-18-42-33/', 0),
(34, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-18-46-34/', 0),
(35, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-18-53-35/', 0),
(36, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-19-49-36/', 0),
(37, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-10-37/', 0),
(38, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-17-38/', 0),
(39, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-30-39/', 0),
(40, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-33-40/', 0),
(41, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-36-41/', 0),
(42, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-41-42/', 0),
(43, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-43-43/', 0),
(44, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-47-44/', 0),
(45, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-48-45/', 0),
(46, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-0-53-46/', 0),
(47, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-1-0-47/', 0),
(48, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-1-4-48/', 0),
(49, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-1-5-49/', 0),
(50, '2012-08-04', 1, 2, 'archivio_visite/1/2012-8-4-1-7-50/', 0),
(54, '2012-08-02', 1, 2, 'archivio_visite12012-8-2-17-3-3', 0),
(55, '2012-08-02', 1, 2, 'archivio_visite12012-8-2-17-3-3', 0),
(56, '2012-08-02', 1, 2, 'archivio_visite12012-8-2-17-3-3', 0),
(57, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(58, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(59, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(60, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(61, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(62, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(63, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(64, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(65, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(66, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(67, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(68, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(69, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(70, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(71, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(72, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(73, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(74, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(75, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(76, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(77, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(78, '2012-08-02', 1, 2, 'archivio_visite/1/2012-8-2-17-3-3', 0),
(79, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-11-15-15', 0),
(80, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-11-15-15', 0),
(81, '2012-08-03', 1, 2, 'archivio_visite/1/2012-8-3-11-15-15', 0),
(82, '2012-08-22', 1, 2, 'archivio_visite/1/2012-8-22-11-26-26/', 0),
(83, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-44-83/', 0),
(84, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-47-84/', 0),
(85, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-49-85/', 0),
(86, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-50-86/', 0),
(87, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-52-87/', 0),
(88, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-55-88/', 0),
(89, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-17-58-89/', 0),
(90, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-6-90/', 0),
(91, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-7-91/', 0),
(92, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-8-92/', 0),
(93, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-10-93/', 0),
(94, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-11-94/', 0),
(95, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-12-95/', 0),
(96, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-14-96/', 0),
(97, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-18-15-97/', 0),
(98, '2012-08-27', 1, 1, 'archivio_visite/1/2012-8-27-20-20-98/', 0),
(99, '2012-08-28', 1, 1, 'archivio_visite/1/2012-8-28-11-2-99/', 0),
(100, '2012-08-28', 1, 1, 'archivio_visite/1/2012-8-28-18-8-100/', 0),
(101, '2012-08-28', 1, 1, 'archivio_visite/1/2012-8-28-18-18-101/', 0),
(102, '2012-08-28', 1, 1, 'archivio_visite/1/2012-8-28-18-22-102/', 0),
(103, '2012-08-28', 1, 1, 'archivio_visite/1/2012-8-28-18-23-103/', 0),
(104, '2012-08-28', 1, 1, 'archivio_visite/1/2012-8-28-18-30-104/', 0),
(105, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-11-47-105/', 0),
(106, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-11-58-106/', 0),
(107, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-12-10-107/', 0),
(108, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-12-17-108/', 0),
(109, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-12-21-109/', 0),
(110, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-12-40-110/', 0),
(111, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-12-48-111/', 0),
(112, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-15-4-112/', 0),
(113, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-15-15-113/', 0),
(114, '2012-08-29', 1, 2, 'archivio_visite/1/2012-8-29-15-21-114/', 0),
(115, '2012-08-29', 1, 1, 'archivio_visite/1/2012-8-29-16-2-115/', 0),
(116, '2012-08-29', 1, 1, 'archivio_visite/1/2012-8-29-16-3-116/', 0),
(117, '2012-08-29', 1, 1, 'archivio_visite/1/2012-8-29-16-20-117/', 0),
(118, '2012-08-29', 1, 1, 'archivio_visite/1/2012-8-29-16-22-118/', 0),
(119, '2012-08-29', 1, 1, 'archivio_visite/1/2012-8-29-16-29-119/', 0),
(120, '2012-08-29', 1, 1, 'archivio_visite/1/2012-8-29-16-33-120/', 0),
(121, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-14-51-121/', 0),
(122, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-14-55-122/', 0),
(123, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-14-56-123/', 0),
(124, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-14-57-124/', 0),
(125, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-0-125/', 0),
(126, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-0-126/', 0),
(127, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-5-127/', 0),
(128, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-6-128/', 0),
(129, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-14-129/', 0),
(130, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-15-130/', 0),
(131, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-16-131/', 0),
(132, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-18-132/', 0),
(133, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-15-59-133/', 0),
(134, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-16-8-134/', 0),
(135, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-16-18-135/', 0),
(136, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-16-24-136/', 0),
(137, '2012-09-03', 1, 1, NULL, 0),
(138, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-16-35-138/', 0),
(139, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-16-36-139/', 0),
(140, '2012-09-03', 1, 1, 'archivio_visite/1/2012-9-3-16-37-140/', 0),
(141, '2012-09-04', 1, 2, 'archivio_visite/1/2012-9-4-10-20-141/', 0),
(142, '2012-09-04', 1, 2, 'archivio_visite/1/2012-9-4-10-25-142/', 0),
(143, '2012-09-04', 1, 2, 'archivio_visite/1/2012-9-4-11-14-143/', 0),
(144, '2012-09-04', 1, 1, 'archivio_visite/1/2012-9-4-12-28-144/', 0),
(145, '2012-09-04', 1, 1, 'archivio_visite/1/2012-9-4-12-34-145/', 0),
(146, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-25-146/', 0),
(147, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-28-147/', 0),
(148, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-38-148/', 0),
(149, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-40-149/', 0),
(150, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-42-150/', 0),
(151, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-43-151/', 0),
(152, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-44-152/', 0),
(153, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-45-153/', 0),
(154, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-46-154/', 0),
(155, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-46-155/', 0),
(156, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-47-156/', 0),
(157, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-48-157/', 0),
(158, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-14-49-158/', 0),
(159, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-15-4-159/', 0),
(160, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-15-53-160/', 0),
(161, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-15-55-161/', 0),
(162, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-15-57-162/', 0),
(163, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-16-16-163/', 0),
(164, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-16-21-164/', 0),
(165, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-16-28-165/', 0),
(166, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-16-29-166/', 0),
(167, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-16-38-167/', 0),
(168, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-17-14-168/', 0),
(169, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-17-30-169/', 0),
(170, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-22-0-170/', 0),
(171, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-22-1-171/', 0),
(172, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-22-4-172/', 0),
(173, '2012-09-05', 4, 1, 'archivio_visite/4/2012-9-5-22-6-173/', 0),
(174, '2012-09-07', 1, 2, 'archivio_visite/1/2012-9-7-19-49-174/', 0),
(175, '2012-09-07', 1, 2, 'archivio_visite/1/2012-9-7-19-56-175/', 0),
(176, '2012-09-07', 1, 2, 'archivio_visite/1/2012-9-7-20-2-176/', 0),
(177, '2012-09-08', 1, 2, 'archivio_visite/1/2012-9-8-0-56-177/', 0),
(178, '2012-09-08', 1, 2, 'archivio_visite/1/2012-9-8-1-5-178/', 0),
(179, '2012-09-08', 1, 2, 'archivio_visite/1/2012-9-8-1-8-179/', 0),
(180, '2012-09-08', 1, 2, 'archivio_visite/1/2012-9-8-1-16-180/', 0),
(181, '2012-09-08', 1, 2, 'archivio_visite/1/2012-9-8-1-20-181/', 0),
(182, '2012-09-08', 1, 2, 'archivio_visite/1/2012-9-8-1-23-182/', 0),
(183, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-10-58-183/', 0),
(184, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-11-17-184/', 0),
(185, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-11-45-185/', 0),
(186, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-11-58-186/', 0),
(187, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-12-41-187/', 0),
(188, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-14-28-188/', 0),
(189, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-16-41-189/', 0),
(190, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-16-42-190/', 0),
(191, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-16-44-191/', 0),
(192, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-16-46-192/', 0),
(193, '2012-09-09', 1, 2, 'archivio_visite/1/2012-9-9-17-3-193/', 0),
(194, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-4-12-194/', 0),
(195, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-4-15-195/', 0),
(196, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-4-16-196/', 0),
(197, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-4-17-197/', 0),
(198, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-4-25-198/', 0),
(199, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-4-36-199/', 0),
(200, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-10-6-200/', 0),
(201, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-10-9-201/', 0),
(202, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-10-11-202/', 0),
(203, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-10-12-203/', 0),
(204, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-10-15-204/', 0),
(205, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-10-36-205/', 0),
(206, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-11-50-206/', 0),
(207, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-12-28-207/', 0),
(208, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-12-35-208/', 0),
(209, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-12-39-209/', 0),
(210, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-12-42-210/', 0),
(211, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-45-211/', 0),
(212, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-47-212/', 0),
(213, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-52-213/', 0),
(214, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-54-214/', 0),
(215, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-56-215/', 0),
(216, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-58-216/', 0),
(217, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-12-58-217/', 0),
(218, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-13-0-218/', 0),
(219, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-13-1-219/', 0),
(220, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-13-1-220/', 0),
(221, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-13-1-221/', 0),
(222, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-14-9-222/', 0),
(223, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-14-9-223/', 0),
(224, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-14-36-224/', 0),
(225, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-16-12-225/', 0),
(226, '2012-09-10', 1, 1, 'archivio_visite/1/2012-9-10-16-12-226/', 0),
(227, '2012-09-10', 1, 2, 'archivio_visite/1/2012-9-10-16-25-227/', 0),
(228, '2012-09-11', 1, 2, 'archivio_visite/1/2012-9-11-14-27-228/', 0),
(229, '2012-09-11', 1, 2, 'archivio_visite/1/2012-9-11-14-38-229/', 0),
(230, '2012-09-11', 1, 2, 'archivio_visite/1/2012-9-11-14-49-230/', 0),
(231, '2012-09-11', 1, 2, 'archivio_visite/1/2012-9-11-14-58-231/', 0),
(232, '2012-09-11', 1, 1, 'archivio_visite/1/2012-9-11-15-33-232/', 0),
(233, '2012-09-11', 1, 1, 'archivio_visite/1/2012-9-11-15-33-233/', 0),
(234, '2012-09-11', 1, 1, 'archivio_visite/1/2012-9-11-23-46-234/', 0),
(235, '2012-09-11', 1, 1, 'archivio_visite/1/2012-9-11-23-46-235/', 0),
(236, '2012-09-11', 1, 1, 'archivio_visite/1/2012-9-11-23-56-236/', 0),
(237, '2012-09-11', 1, 1, 'archivio_visite/1/2012-9-11-23-56-237/', 0),
(238, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-14-51-238/', 0),
(239, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-14-51-239/', 0),
(240, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-18-0-240/', 0),
(241, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-18-0-241/', 0),
(242, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-18-1-242/', 0),
(243, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-18-1-243/', 0),
(244, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-18-9-244/', 0),
(245, '2012-09-12', 1, 1, 'archivio_visite/1/2012-9-12-18-9-245/', 0),
(246, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-17-35-246/', 0),
(247, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-17-35-247/', 0),
(248, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-17-37-248/', 0),
(249, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-17-37-249/', 0),
(250, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-17-54-250/', 0),
(251, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-17-54-251/', 0),
(252, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-18-5-252/', 0),
(253, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-18-5-253/', 0),
(254, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-18-31-254/', 0),
(255, '2012-09-13', 1, 1, 'archivio_visite/1/2012-9-13-18-31-255/', 0),
(256, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-22-29-256/', 0),
(257, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-22-41-257/', 0),
(258, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-22-45-258/', 0),
(259, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-22-52-259/', 0),
(260, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-22-55-260/', 0),
(261, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-22-58-261/', 0),
(262, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-5-262/', 0),
(263, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-7-263/', 0),
(264, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-10-264/', 0),
(265, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-12-265/', 0),
(266, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-22-266/', 0),
(267, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-30-267/', 0),
(268, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-40-268/', 0),
(269, '2012-09-17', 1, 2, 'archivio_visite/1/2012-9-17-23-55-269/', 0),
(270, '2012-09-18', 1, 2, 'archivio_visite/1/2012-9-18-0-11-270/', 0),
(271, '2012-09-18', 1, 2, 'archivio_visite/1/2012-9-18-0-13-271/', 0),
(272, '2012-09-18', 1, 2, 'archivio_visite/1/2012-9-18-1-22-272/', 0),
(273, '2012-09-18', 1, 2, 'archivio_visite/1/2012-9-18-1-24-273/', 0),
(274, '2012-09-19', 1, 2, 'archivio_visite/1/2012-9-19-0-30-274/', 0),
(275, '2012-09-19', 1, 2, 'archivio_visite/1/2012-9-19-0-36-275/', 0),
(276, '2012-09-19', 1, 2, 'archivio_visite/1/2012-9-19-0-40-276/', 0),
(277, '2012-09-19', 1, 2, 'archivio_visite/1/2012-9-19-0-44-277/', 0),
(278, '2012-09-19', 1, 2, 'archivio_visite/1/2012-9-19-1-12-278/', 0),
(279, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-1-22-279/', 0),
(280, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-22-34-280/', 0),
(281, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-22-34-281/', 0),
(282, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-22-36-282/', 0),
(283, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-22-36-283/', 0),
(284, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-25-284/', 0),
(285, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-26-285/', 0),
(286, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-27-286/', 0),
(287, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-27-287/', 0),
(288, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-31-288/', 0),
(289, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-31-289/', 0),
(290, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-43-290/', 0),
(291, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-44-291/', 0),
(292, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-44-292/', 0),
(293, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-56-293/', 0),
(294, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-56-294/', 0),
(295, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-58-295/', 0),
(296, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-59-296/', 0),
(297, '2012-09-19', 1, 1, 'archivio_visite/1/2012-9-19-23-59-297/', 0),
(298, '2012-09-20', 1, 1, 'archivio_visite/1/2012-9-20-0-0-298/', 0),
(299, '2012-09-20', 1, 1, 'archivio_visite/1/2012-9-20-0-0-299/', 0),
(300, '2012-09-20', 1, 1, 'archivio_visite/1/2012-9-20-0-0-300/', 0),
(301, '2012-09-23', 1, 2, 'archivio_visite/1/2012-9-23-19-21-301/', 0),
(302, '2012-09-23', 1, 2, 'archivio_visite/1/2012-9-23-19-33-302/', 0),
(303, '2012-09-23', 1, 2, 'archivio_visite/1/2012-9-23-19-36-303/', 0),
(304, '2012-09-23', 1, 2, 'archivio_visite/1/2012-9-23-19-45-304/', 0),
(305, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-26-305/', 0),
(306, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-26-306/', 0),
(307, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-35-307/', 0),
(308, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-35-308/', 0),
(309, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-36-309/', 0),
(310, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-36-310/', 0),
(311, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-39-311/', 0),
(312, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-39-312/', 0),
(313, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-44-313/', 0),
(314, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-44-314/', 0),
(315, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-50-315/', 0),
(316, '2012-09-28', 1, 1, 'archivio_visite/1/2012-9-28-16-50-316/', 0),
(317, '2012-09-30', 1, 2, 'archivio_visite/1/2012-9-30-18-14-317/', 0),
(318, '2012-09-30', 1, 2, 'archivio_visite/1/2012-9-30-18-30-318/', 0),
(319, '2012-09-30', 1, 2, 'archivio_visite/1/2012-9-30-18-34-319/', 0),
(320, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-320/', 1),
(321, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-321/', 1),
(322, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-322/', 1),
(323, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-323/', 1),
(324, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-324/', 1),
(325, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-325/', 1),
(326, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-326/', 1),
(327, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-327/', 1),
(328, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-328/', 1),
(329, '2012-10-01', 1, 1, 'archivio_visite/1/2012-10-01-17-30-329/', 1),
(330, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-330/', 1),
(331, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-331/', 1),
(332, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-332/', 1),
(333, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-333/', 1),
(334, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-334/', 1),
(335, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-335/', 1),
(336, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-336/', 1),
(337, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-337/', 1),
(338, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-338/', 1),
(339, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-339/', 1),
(340, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-340/', 1),
(341, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-341/', 1),
(342, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-342/', 1),
(343, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-343/', 1),
(344, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-344/', 1),
(345, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-345/', 1),
(346, '2012-10-02', 1, 1, 'archivio_visite/1/2012-10-02-10-36-346/', 1),
(347, '2012-10-03', 1, 1, 'archivio_visite/1/2012-10-03-18-28-347/', 1),
(348, '2012-10-03', 1, 1, 'archivio_visite/1/2012-10-03-18-22-348/', 1),
(349, '2012-10-04', 1, 2, 'archivio_visite/1/2012-10-04-19-1-349/', 1),
(350, '2012-10-03', 1, 1, 'archivio_visite/1/2012-10-03-18-22-350/', 1),
(351, '2012-10-03', 1, 1, 'archivio_visite/1/2012-10-03-18-28-351/', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
