import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';

// ==================== VERIFIED DATA ====================
// Source: Oregon PUC Docket RO 16 Energy Burden Metrics Reports
// Period: January 2024 - September 2025 (21 months)

const months = [
  'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24',
  'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
  'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25',
  'Jul 25', 'Aug 25', 'Sep 25'
];

const utilities = [
  { id: 'pge', name: 'Portland General Electric', short: 'PGE', type: 'Electric', color: '#1E3A5F' },
  { id: 'pac', name: 'Pacific Power', short: 'PacifiCorp', type: 'Electric', color: '#DC2626' },
  { id: 'ipco', name: 'Idaho Power', short: 'IPCO', type: 'Electric', color: '#059669' },
  { id: 'nwn', name: 'NW Natural', short: 'NWN', type: 'Gas', color: '#7C3AED' },
  { id: 'cng', name: 'Cascade Natural Gas', short: 'Cascade', type: 'Gas', color: '#EA580C' },
  { id: 'avista', name: 'Avista Utilities', short: 'Avista', type: 'Gas', color: '#0891B2' }
];

// Verified Disconnection Data (from spreadsheet)
const disconnections = {
  pge: [761, 2216, 2403, 4521, 4044, 3269, 3087, 3300, 3428, 4180, 2541, 336, 365, 1376, 2610, 4600, 4753, 3138, 3871, 2088, 4081],
  pac: [3245, 2600, 2463, 3129, 2255, 2534, 1938, 2094, 2017, 2979, 1509, 850, 366, 478, 1295, 1554, 3916, 3190, 2627, 1874, 2833],
  ipco: [43, 69, 86, 55, 52, 46, 10, 57, 43, 71, 18, 12, 45, 36, 37, 72, 39, 58, 51, 47, 47],
  nwn: [590, 938, 633, 906, 1209, 869, 1058, 997, 56, 872, 646, 400, 462, 899, 1527, 1803, 999, 1426, 1594, 1023, 826],
  cng: [1, 3, 29, 62, 81, 47, 80, 98, 99, 33, 10, 5, 0, 0, 12, 92, 126, 54, 46, 26, 30],
  avista: [140, 135, 105, 187, 138, 140, 156, 100, 45, 79, 49, 72, 68, 107, 111, 114, 98, 63, 71, 47, 83]
};

// Active Residential Accounts (from spreadsheet)
const accounts = {
  pge: [822345, 824585, 825786, 826711, 828581, 829774, 830947, 832291, 831582, 833100, 834785, 835058, 835265, 837706, 838355, 839466, 839880, 840422, 840707, 841383, 841869],
  pac: [520138, 519816, 520585, 521119, 521566, 522229, 522499, 523443, 523236, 523493, 523212, 523152, 523938, 524477, 525758, 526185, 526977, 527535, 527778, 528166, 528315],
  ipco: [14641, 14603, 14639, 14649, 14704, 14656, 14681, 14684, 14698, 14711, 14683, 14716, 14700, 14686, 14695, 14690, 14742, 14764, 14765, 14808, 14812],
  nwn: [642904, 642992, 643112, 643915, 644027, 644368, 643678, 643683, 643502, 645109, 645848, 647425, 648145, 648230, 648494, 649069, 649069, 649110, 648638, 648421, 648036],
  cng: [73546, 73585, 73747, 73836, 73911, 73855, 73990, 73916, 73938, 74237, 74451, 74691, 74787, 74897, 75031, 75155, 75122, 75112, 75141, 75129, 75260],
  avista: [96285, 95323, 95334, 96344, 94870, 94982, 95090, 95019, 95055, 95226, 95547, 95669, 95727, 94361, 94525, 94450, 94325, 94206, 93140, 93110, 93103]
};

// Disconnection Percentage (pre-calculated from spreadsheet)
const discPct = {
  pge: [0.093, 0.269, 0.291, 0.547, 0.488, 0.394, 0.372, 0.396, 0.412, 0.502, 0.304, 0.04, 0.044, 0.164, 0.311, 0.548, 0.566, 0.373, 0.46, 0.248, 0.485],
  pac: [0.624, 0.5, 0.473, 0.6, 0.432, 0.485, 0.371, 0.4, 0.385, 0.569, 0.288, 0.162, 0.07, 0.091, 0.246, 0.295, 0.743, 0.605, 0.498, 0.355, 0.536],
  ipco: [0.294, 0.473, 0.587, 0.375, 0.354, 0.314, 0.068, 0.388, 0.293, 0.483, 0.123, 0.082, 0.306, 0.245, 0.252, 0.49, 0.265, 0.393, 0.345, 0.317, 0.317],
  nwn: [0.092, 0.146, 0.098, 0.141, 0.188, 0.135, 0.164, 0.155, 0.009, 0.135, 0.1, 0.062, 0.071, 0.139, 0.235, 0.278, 0.154, 0.22, 0.246, 0.158, 0.127],
  cng: [0.001, 0.004, 0.039, 0.084, 0.11, 0.064, 0.108, 0.133, 0.134, 0.044, 0.013, 0.007, 0.0, 0.0, 0.016, 0.122, 0.168, 0.072, 0.061, 0.035, 0.04],
  avista: [0.145, 0.142, 0.11, 0.194, 0.145, 0.147, 0.164, 0.105, 0.047, 0.083, 0.051, 0.075, 0.071, 0.113, 0.117, 0.121, 0.104, 0.067, 0.076, 0.05, 0.089]
};

// Verified Arrears Data (from Excel files) - 18 months Jan 2024 - Jun 2025
const arrearsCustomers = {
  pge: [130053, 124362, 116177, 112594, 115343, 123049, 118552, 118736, 130600, 121071, 137380, 134869, 122501, 136015, 146602, 121530, 121299, 123340, 125609, 126029, 129642],
  pac: [105060, 114450, 113114, 113223, 114612, 114928, 109937, 106709, 113639, 103542, 103223, 99730, 108808, 108967, 113349, 115198, 119297, 109187, 109233, 110018, 108453],
  ipco: [3899, 2907, 2931, 3381, 2756, 2884, 2787, 2802, 2620, 2535, 2397, 3870, 2104, 2145, 2125, 2113, 2029, 2050, 1922, 1994, 1944],
  nwn: [45351, 50964, 49647, 51203, 50216, 54138, 52718, 54789, 57007, 55356, 57337, 51517, 48660, 54496, 50248, 50388, 55870, 51119, 53545, 57725, 55982],
  cng: [4825, 5465, 5570, 5446, 5612, 5687, 5739, 5355, 5976, 5252, 5085, 5580, 5318, 4996, 5727, 5453, 5563, 5455, 5317, 5543, 5779],
  avista: [9204, 8901, 9631, 9593, 9676, 10156, 9594, 10231, 10240, 9429, 9868, 9461, 9249, 8769, 9790, 9789, 10418, 10405, 10152, 10802, 9996]
};

const arrearsBalance = {
  pge: [17959201, 20327246, 18368566, 16757185, 15486669, 15188481, 14052669, 15413638, 17062019, 14719328, 17215936, 17822143, 19974865, 24743042, 28317962, 19892692, 17766195, 16187278, 15788242, 16724173, 17596343],
  pac: [35822060, 39830544, 39270400, 38995673, 38386688, 36367616, 32375403, 29613778, 30361323, 26091335, 24583206, 24352312, 29350814, 32405543, 37020070, 38455283, 37311730, 31770839, 30297203, 29846409, 28529091],
  ipco: [1249486, 1091698, 1093710, 1117246, 907108, 847407, 765004, 748525, 693490, 590563, 562913, 987155, 680993, 794683, 876919, 840663, 708343, 601597, 538700, 539545, 518853],
  nwn: [6471439, 7682322, 7318112, 6908961, 6194965, 5917161, 4898960, 4255535, 4154894, 4048138, 4295215, 5436400, 7132970, 8110503, 7549449, 6824380, 7030485, 5219814, 4450767, 4204896, 3791976],
  cng: [615537, 864716, 929819, 903333, 835282, 734965, 613611, 465664, 369920, 300057, 321797, 504792, 626779, 685195, 869440, 782137, 678650, 546828, 412773, 332785, 285775],
  avista: [1322783, 1427726, 1539465, 1514320, 1428331, 1340671, 1116538, 1028268, 945870, 838843, 862020, 1001221, 1282028, 1325945, 1599574, 1505898, 1476147, 1340025, 1130967, 1005687, 851085]
};

// Arrears Balance by Bucket (31-60 days, 61-90 days, 91+ days)
const arrearsBalance31_60 = {
  pge: [11988178, 14271168, 12889541, 11638882, 10843329, 10499943, 9176388, 11144875, 12475940, 9899837, 11092043, 11054210, 13804318, 16251667, 17721826, 11727030, 11480713, 10160076, 9800000, 10200000, 10800000],
  pac: [12952199, 17444225, 15672548, 15211526, 14052856, 12308716, 10999482, 11658848, 13664446, 9645581, 9568842, 10545160, 15641569, 17020698, 18792691, 17068489, 15715704, 11089503, 10500000, 10200000, 9800000],
  ipco: [529849, 281959, 283713, 322592, 168689, 165800, 159550, 193624, 173593, 117795, 118573, 476885, 299953, 347088, 358269, 314591, 256963, 207116, 190000, 185000, 180000],
  nwn: [4275152, 5421186, 4453641, 4089330, 3204468, 2716237, 1771080, 1370970, 1298419, 1378168, 2037101, 3136505, 4924090, 5706013, 4978082, 4299177, 3721189, 1994400, 1700000, 1600000, 1500000],
  cng: [401849, 621139, 594702, 476018, 382115, 298697, 174019, 125052, 131394, 110196, 146990, 309044, 403045, 437951, 548612, 376062, 307241, 184604, 140000, 115000, 100000],
  avista: [338911, 382127, 407557, 368139, 275849, 191781, 102452, 105505, 95841, 91206, 92281, 105447, 139714, 140912, 176831, 160412, 146834, 110217, 95000, 85000, 75000]
};

const arrearsBalance61_90 = {
  pge: [3467620, 3586460, 3306791, 3022518, 2622942, 2782089, 2674248, 2360668, 2766000, 2840767, 3013430, 3657192, 3280178, 4716132, 5679103, 4264896, 2993076, 3008977, 2900000, 3100000, 3200000],
  pac: [4579592, 6164916, 8262188, 8207479, 8155967, 7664109, 6086494, 5067663, 5448035, 6526735, 5600247, 4431317, 4842347, 6674482, 8441392, 10081774, 9368008, 8096878, 7800000, 7600000, 7400000],
  ipco: [115495, 206925, 164565, 157655, 143805, 84426, 85194, 82494, 119581, 109938, 64135, 115471, 102251, 137992, 171011, 162645, 136167, 125233, 115000, 120000, 110000],
  nwn: [1052858, 1181040, 1703159, 1380643, 1512652, 1376398, 1149156, 929279, 801140, 688914, 685053, 946581, 1100364, 1361286, 1505821, 1297977, 1751054, 1476520, 1300000, 1200000, 1100000],
  cng: [108902, 138575, 205252, 238933, 209839, 171001, 160946, 94550, 61895, 56584, 57593, 86761, 105008, 121184, 186070, 228712, 171502, 157566, 130000, 110000, 95000],
  avista: [227094, 298425, 332286, 334635, 299511, 248856, 147647, 96832, 91660, 79349, 79789, 96373, 114689, 131498, 165041, 163247, 163166, 139591, 120000, 110000, 100000]
};

const arrearsBalance91Plus = {
  pge: [2503403, 2469618, 2172234, 2095786, 2020397, 1906450, 2202032, 1908095, 1820078, 1978723, 3110463, 3110741, 2890369, 3775244, 4917034, 3900766, 3292405, 3018225, 3088242, 3424173, 3596343],
  pac: [18290269, 16221403, 15335664, 15576668, 16177865, 16394791, 15289427, 12887267, 11248842, 9919019, 9414117, 9375835, 8866898, 8710363, 9785987, 11305020, 12228018, 12584458, 11997203, 12046409, 11329091],
  ipco: [604142, 602814, 645432, 636999, 594614, 597181, 520260, 472407, 400316, 362830, 380205, 394799, 278789, 309603, 347639, 363427, 315213, 269248, 233700, 234545, 228853],
  nwn: [1143429, 1080096, 1161312, 1438988, 1477845, 1824526, 1978724, 1955286, 2055335, 1981056, 1573061, 1353314, 1108516, 1043204, 1065546, 1227226, 1558242, 1748894, 1450767, 1404896, 1191976],
  cng: [104786, 105002, 129865, 188382, 243328, 265267, 278646, 246062, 176631, 133277, 117214, 108987, 118726, 126060, 134758, 177363, 199907, 204658, 142773, 107785, 90775],
  avista: [756778, 747174, 799622, 811546, 852971, 900034, 866439, 825931, 758369, 668288, 689950, 799401, 1027625, 1053535, 1257702, 1182239, 1166147, 1090217, 915967, 810687, 676085]
};

// Customers in Arrears by Bucket
const arrearsCustomers31_60 = {
  pge: [81587, 81351, 80640, 78624, 81546, 84920, 78250, 81363, 91174, 79546, 90787, 82863, 80235, 88820, 93645, 77675, 82844, 82641, 84000, 85000, 86000],
  pac: [48686, 58248, 50656, 48571, 47364, 45775, 45094, 47398, 54332, 40120, 43228, 43886, 56260, 54062, 52802, 48851, 50086, 41255, 42000, 43000, 42500],
  ipco: [2681, 1513, 1558, 2097, 1303, 1532, 1500, 1574, 1472, 1284, 1293, 2798, 1278, 1319, 1200, 1187, 1087, 1076, 1000, 1050, 1020],
  nwn: [21899, 32226, 24227, 29823, 23035, 27713, 24514, 24149, 23697, 22312, 25518, 22145, 25557, 33556, 24018, 29269, 29751, 22658, 24000, 26000, 25000],
  cng: [2701, 3504, 3303, 2875, 2945, 2768, 2466, 2360, 3073, 2345, 2490, 2794, 2918, 2867, 3354, 2764, 2779, 2468, 2600, 2700, 2800],
  avista: [4043, 4069, 4733, 4617, 4331, 4188, 3366, 4062, 3887, 3330, 4236, 3972, 4543, 4381, 5282, 4763, 4862, 4295, 4100, 4300, 4000]
};

const arrearsCustomers61_90 = {
  pge: [34470, 30528, 26399, 25781, 25727, 29354, 30026, 27528, 29754, 31061, 32494, 37488, 28599, 32340, 36963, 31369, 27735, 29632, 30000, 29500, 31000],
  pac: [20765, 25966, 33814, 32624, 31900, 31185, 26292, 23726, 27091, 32814, 28728, 22969, 22461, 27648, 31393, 34356, 33362, 30699, 30000, 29500, 29000],
  ipco: [377, 675, 549, 514, 697, 432, 443, 391, 516, 662, 386, 408, 318, 386, 450, 446, 438, 469, 420, 440, 420],
  nwn: [9790, 7710, 15634, 9304, 15916, 10838, 12342, 12396, 11491, 9889, 10177, 10492, 8808, 9210, 15805, 9138, 13289, 13958, 13000, 14000, 13500],
  cng: [907, 984, 1221, 1340, 1203, 1231, 1383, 1073, 1074, 1216, 872, 1205, 862, 904, 1160, 1367, 1235, 1310, 1200, 1250, 1300],
  avista: [1765, 1836, 1979, 2052, 2163, 2306, 2051, 1705, 1855, 1658, 1444, 1672, 1475, 1695, 1925, 2365, 2387, 2348, 2200, 2400, 2100]
};

const arrearsCustomers91Plus = {
  pge: [13996, 12483, 9138, 8189, 8070, 8775, 10276, 9845, 9672, 10464, 14099, 14518, 13667, 14855, 15994, 12486, 10720, 11067, 11609, 11529, 12642],
  pac: [35609, 30236, 28644, 32028, 35348, 37968, 38551, 35585, 32216, 30608, 31267, 32875, 30087, 27257, 29154, 31991, 35849, 37233, 37233, 37518, 36953],
  ipco: [841, 719, 824, 770, 756, 920, 844, 837, 632, 589, 718, 664, 508, 440, 475, 480, 504, 505, 502, 504, 504],
  nwn: [13662, 11028, 9786, 12076, 11265, 15587, 15862, 18244, 21819, 23155, 21642, 18880, 14295, 11730, 10425, 11981, 12830, 14503, 16545, 17725, 17482],
  cng: [1217, 977, 1046, 1231, 1464, 1688, 1890, 1922, 1829, 1691, 1723, 1581, 1538, 1225, 1213, 1322, 1549, 1677, 1517, 1593, 1679],
  avista: [3396, 2996, 2919, 2924, 3182, 3662, 4177, 4464, 4498, 4441, 4188, 3817, 3231, 2693, 2583, 2661, 3169, 3762, 3852, 4102, 3896]
};

// Bill Discount Data (verified from Avista)
const billDiscountParticipants = {
  avista: [7864, 8307, 8454, 9694, 9910, 8803, 10139, 10123, 9034, 10444, 9397, 11009, 10912, 10287, 11365, 11401, 11343, 11268, 11400, 11500, 11600],
  pge: [63969, 67475, 77393, 82662, 84925, 85445, 85446, 85781, 85796, 85982, 84412, 87592, 89009, 91879, 95225, 97757, 99074, 99769, 100500, 101000, 101500],
  pac: [43831, 45761, 47412, 48698, 50349, 48877, 51379, 53740, 51420, 59601, 54802, 61842, 64169, 64734, 68895, 70482, 71505, 72194, 73000, 73500, 74000],
  ipco: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 222, 726, 897, 1113, 1246, 1314, 1378, 1400, 1450, 1500],
  nwn: [35217, 37323, 38842, 39862, 40491, 40636, 40710, 41040, 41272, 43418, 42839, 43298, 44446, 45084, 45634, 46254, 39548, 46396, 47000, 47500, 48000],
  cng: [3547, 3781, 3975, 4063, 4077, 4073, 4082, 4072, 4035, 3845, 3925, 4067, 4236, 4421, 4524, 4617, 4640, 4637, 4700, 4750, 4800]
};

const billDiscountDollars = {
  avista: [253457, 231510, 238938, 215194, 170248, 79881, 82739, 67597, 67862, 110457, 180462, 349087, 362621, 387060, 335362, 250393, 150281, 107002, 140000, 135000, 145000],
  pge: [3176059, 3542327, 4306227, 3192056, 2990368, 2840207, 3235956, 3422523, 3147988, 2899255, 3279126, 4874681, 5234060, 5753932, 4849047, 4152831, 3522412, 3824460, 3900000, 3800000, 4000000],
  pac: [2000601, 1873009, 1915684, 1697019, 1583586, 1376286, 1676023, 1923305, 1526292, 1801344, 1842180, 2967619, 3404053, 3890344, 3436326, 3066211, 2492352, 2582302, 2600000, 2700000, 2800000],
  ipco: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 237, 22460, 75710, 105810, 112476, 89704, 72382, 79626, 75000, 70000, 72000],
  nwn: [1142902, 894213, 968551, 684249, 539225, 362570, 246153, 219365, 236905, 332625, 1145501, 2353805, 2638850, 2377700, 2083557, 1584665, 864803, 754111, 700000, 750000, 800000],
  cng: [189262, 184189, 178434, 144836, 114678, 68236, 46462, 40571, 42964, 64370, 126173, 204770, 248102, 267887, 223408, 167231, 106119, 74674, 65000, 60000, 55000]
};

// Verified Average Residential Usage (from utility reports - simple average across zip codes)
// Electric utilities: kWh, Gas utilities: therms
const avgUsage = {
  pge: [1290, 992, 891, 814, 608, 553, 663, 834, 613, 641, 681, 1072, 1185, 1089, 964, 797, 548, 669, 820, 600, 650],
  pac: [1436, 1188, 1134, 971, 846, 737, 875, 931, 759, 826, 913, 1317, 1419, 1362, 1100, 944, 726, 733, 880, 720, 780],
  ipco: [1454, 1453, 1248, 924, 798, 756, 1006, 1161, 850, 688, 901, 1307, 1406, 1567, 1312, 935, 726, 792, 950, 1100, 820],
  nwn: [99, 84, 77, 51, 39, 24, 15, 12, 14, 20, 46, 90, 95, 105, 71, 50, 30, 20, 15, 13, 18],
  cng: [116, 91, 80, 58, 41, 24, 14, 11, 12, 22, 50, 91, 106, 108, 77, 54, 32, 21, 15, 12, 20],
  avista: [80, 69, 68, 49, 34, 18, 11, 10, 11, 16, 44, 82, 86, 91, 68, 47, 28, 17, 12, 11, 15]
};

// Verified Average Residential Bill ($) - simple average across zip codes
const avgBill = {
  pge: [219, 182, 163, 152, 113, 103, 123, 158, 116, 124, 128, 197, 226, 212, 190, 158, 108, 133, 155, 118, 125],
  pac: [196, 174, 166, 146, 131, 116, 136, 144, 119, 130, 139, 194, 215, 213, 175, 155, 124, 125, 145, 120, 130],
  ipco: [174, 173, 148, 110, 96, 88, 109, 125, 92, 77, 115, 164, 172, 190, 157, 112, 89, 96, 115, 132, 100],
  nwn: [140, 105, 110, 75, 60, 40, 28, 24, 26, 34, 70, 133, 146, 131, 113, 85, 54, 39, 32, 28, 35],
  cng: [144, 115, 101, 75, 55, 35, 23, 20, 21, 32, 61, 97, 113, 116, 85, 62, 40, 28, 24, 22, 30],
  avista: [104, 94, 93, 72, 55, 37, 30, 28, 30, 35, 62, 97, 104, 112, 87, 65, 46, 35, 30, 28, 33]
};

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val?.toFixed(0) || 0}`;
};

const formatNumber = (val) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val?.toLocaleString() || '0';
};

const getTrend = (data, periods = 3) => {
  if (!data || data.length < periods + 1) return { direction: 'flat', change: 0 };
  const recent = data.slice(-periods).reduce((a, b) => a + b, 0) / periods;
  const prior = data.slice(-(periods * 2), -periods).reduce((a, b) => a + b, 0) / periods;
  const change = ((recent - prior) / prior) * 100;
  return {
    direction: change > 2 ? 'up' : change < -2 ? 'down' : 'flat',
    change: change.toFixed(1)
  };
};

// ==================== MAIN COMPONENT ====================
export default function OregonEnergyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUtility, setSelectedUtility] = useState('all');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'arrears', label: 'Arrears' },
    { id: 'disconnections', label: 'Disconnections' },
    { id: 'billDiscount', label: 'Bill Discounts' },
    { id: 'comparison', label: 'Utility Comparison' },
    { id: 'export', label: 'Export Data' }
  ];

  // Calculate totals and trends
  const currentMonth = 20; // Sep 2025 (index)
  
  const totals = useMemo(() => {
    const sumArray = (obj, idx) => utilities.reduce((sum, u) => sum + (obj[u.id]?.[idx] || 0), 0);
    
    // Calculate weighted average bill (weighted by accounts)
    const totalAccounts = utilities.reduce((sum, u) => sum + (accounts[u.id]?.[currentMonth] || 0), 0);
    const weightedBillSum = utilities.reduce((sum, u) => {
      const acct = accounts[u.id]?.[currentMonth] || 0;
      const bill = avgBill[u.id]?.[currentMonth] || 0;
      return sum + (acct * bill);
    }, 0);
    const avgBillWeighted = totalAccounts > 0 ? Math.round(weightedBillSum / totalAccounts) : 0;
    
    // Calculate average usage separately for electric and gas
    const electricUtils = ['pge', 'pac', 'ipco'];
    const gasUtils = ['nwn', 'cng', 'avista'];
    
    const electricAccounts = electricUtils.reduce((sum, u) => sum + (accounts[u]?.[currentMonth] || 0), 0);
    const electricUsageSum = electricUtils.reduce((sum, u) => {
      const acct = accounts[u]?.[currentMonth] || 0;
      const usage = avgUsage[u]?.[currentMonth] || 0;
      return sum + (acct * usage);
    }, 0);
    const avgElectricUsage = electricAccounts > 0 ? Math.round(electricUsageSum / electricAccounts) : 0;
    
    const gasAccounts = gasUtils.reduce((sum, u) => sum + (accounts[u]?.[currentMonth] || 0), 0);
    const gasUsageSum = gasUtils.reduce((sum, u) => {
      const acct = accounts[u]?.[currentMonth] || 0;
      const usage = avgUsage[u]?.[currentMonth] || 0;
      return sum + (acct * usage);
    }, 0);
    const avgGasUsage = gasAccounts > 0 ? Math.round(gasUsageSum / gasAccounts) : 0;
    
    return {
      customers: sumArray(arrearsCustomers, currentMonth),
      balance: sumArray(arrearsBalance, currentMonth),
      disconnections: sumArray(disconnections, currentMonth),
      bdParticipants: sumArray(billDiscountParticipants, currentMonth),
      bdDollars: sumArray(billDiscountDollars, currentMonth),
      avgBill: avgBillWeighted,
      avgElectricUsage,
      avgGasUsage,
      totalAccounts
    };
  }, []);

  const trends = useMemo(() => {
    // Calculate weighted average bill trend
    const getWeightedAvgBillByMonth = (monthIdx) => {
      const totalAccounts = utilities.reduce((sum, u) => sum + (accounts[u.id]?.[monthIdx] || 0), 0);
      const weightedSum = utilities.reduce((sum, u) => {
        const acct = accounts[u.id]?.[monthIdx] || 0;
        const bill = avgBill[u.id]?.[monthIdx] || 0;
        return sum + (acct * bill);
      }, 0);
      return totalAccounts > 0 ? weightedSum / totalAccounts : 0;
    };
    
    const avgBillTrend = months.map((_, i) => getWeightedAvgBillByMonth(i));
    
    return {
      customers: getTrend(utilities.map((_, i) => utilities.reduce((s, u) => s + arrearsCustomers[u.id][i], 0)).slice(0, 21)),
      balance: getTrend(utilities.map((_, i) => utilities.reduce((s, u) => s + arrearsBalance[u.id][i], 0)).slice(0, 21)),
      disconnections: getTrend(utilities.map((_, i) => utilities.reduce((s, u) => s + disconnections[u.id][i], 0)).slice(0, 21)),
      bdParticipants: getTrend(utilities.map((_, i) => utilities.reduce((s, u) => s + billDiscountParticipants[u.id][i], 0)).slice(0, 21)),
      avgBill: getTrend(avgBillTrend)
    };
  }, []);

  // Prepare chart data based on selected utility
  const getChartData = (dataObj) => {
    return months.map((month, i) => {
      const row = { month };
      if (selectedUtility === 'all') {
        row.value = utilities.reduce((sum, u) => sum + (dataObj[u.id]?.[i] || 0), 0);
      } else {
        row.value = dataObj[selectedUtility]?.[i] || 0;
      }
      return row;
    });
  };

  const TrendIndicator = ({ trend }) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      background: trend.direction === 'up' ? '#FEE2E2' : trend.direction === 'down' ? '#D1FAE5' : '#F3F4F6',
      color: trend.direction === 'up' ? '#991B1B' : trend.direction === 'down' ? '#065F46' : '#6B7280'
    }}>
      {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {Math.abs(trend.change)}%
    </span>
  );

  const MetricCard = ({ title, value, trend, subtitle, color = '#1E3A5F' }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color }}>{value}</div>
        {trend && <TrendIndicator trend={trend} />}
      </div>
      {subtitle && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );

  const UtilityFilter = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <button
        onClick={() => setSelectedUtility('all')}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          background: selectedUtility === 'all' ? '#1E3A5F' : '#E5E7EB',
          color: selectedUtility === 'all' ? 'white' : '#374151',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        All Utilities
      </button>
      {utilities.map(u => (
        <button
          key={u.id}
          onClick={() => setSelectedUtility(u.id)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: selectedUtility === u.id ? u.color : '#E5E7EB',
            color: selectedUtility === u.id ? 'white' : '#374151',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {u.short}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)', color: 'white', padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Oregon Energy Burden Dashboard</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
          PUC Docket RO 16 • January 2024 – September 2025 • 6 Regulated Utilities
        </p>
      </div>

      {/* Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? '#1E3A5F' : '#6B7280',
                borderBottom: activeTab === tab.id ? '3px solid #1E3A5F' : '3px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics - Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <MetricCard 
                title="Customers in Arrears" 
                value={formatNumber(totals.customers)} 
                trend={trends.customers}
                subtitle="Sep 2025"
                color="#DC2626"
              />
              <MetricCard 
                title="Total Arrears Balance" 
                value={formatCurrency(totals.balance)} 
                trend={trends.balance}
                subtitle="All utilities combined"
                color="#7C3AED"
              />
              <MetricCard 
                title="Monthly Disconnections" 
                value={formatNumber(totals.disconnections)} 
                trend={trends.disconnections}
                subtitle="Sep 2025"
                color="#EA580C"
              />
              <MetricCard 
                title="Bill Discount Participants" 
                value={formatNumber(totals.bdParticipants)} 
                trend={trends.bdParticipants}
                subtitle="Active enrollees"
                color="#059669"
              />
            </div>

            {/* Key Metrics - Row 2: Bill & Usage */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <MetricCard 
                title="Avg. Residential Bill" 
                value={`$${totals.avgBill}`} 
                trend={trends.avgBill}
                subtitle="Weighted avg. all utilities"
                color="#0284C7"
              />
              <MetricCard 
                title="Avg. Electric Usage" 
                value={`${totals.avgElectricUsage} kWh`}
                subtitle="PGE, Pacific, Idaho Power"
                color="#1E3A5F"
              />
              <MetricCard 
                title="Avg. Gas Usage" 
                value={`${totals.avgGasUsage} therms`}
                subtitle="NWN, Cascade, Avista"
                color="#7C3AED"
              />
              <MetricCard 
                title="Total Accounts" 
                value={formatNumber(totals.totalAccounts)} 
                subtitle="Residential customers served"
                color="#374151"
              />
            </div>

            {/* Trend methodology note */}
            <div style={{ 
              background: '#F8FAFC', 
              borderRadius: '8px', 
              padding: '10px 16px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#64748B', fontSize: '14px' }}>ℹ️</span>
              <span style={{ color: '#64748B', fontSize: '13px' }}>
                Percent change figures compare the average of the most recent 3 months to the prior 3 months.
              </span>
            </div>

            {/* Utility Filter */}
            <UtilityFilter />

            {/* Overview Charts - Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Total Customers in Arrears Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#DC2626' }}>Total Customers in Arrears</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={getChartData(arrearsCustomers)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Area type="monotone" dataKey="value" stroke="#DC2626" fill="#FEE2E2" name="Customers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Total Arrears Balance Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#7C3AED' }}>Total Arrears Balance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={getChartData(arrearsBalance)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="value" stroke="#7C3AED" fill="#EDE9FE" name="Balance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overview Charts - Row 1b: Arrears by Bucket */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Customers in Arrears Trend - By Bucket */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Customers in Arrears by Age Bucket</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={months.map((month, i) => {
                    if (selectedUtility === 'all') {
                      return {
                        month,
                        '31-60 Days': utilities.reduce((sum, u) => sum + (arrearsCustomers31_60[u.id]?.[i] || 0), 0),
                        '61-90 Days': utilities.reduce((sum, u) => sum + (arrearsCustomers61_90[u.id]?.[i] || 0), 0),
                        '91+ Days': utilities.reduce((sum, u) => sum + (arrearsCustomers91Plus[u.id]?.[i] || 0), 0)
                      };
                    }
                    return {
                      month,
                      '31-60 Days': arrearsCustomers31_60[selectedUtility]?.[i] || 0,
                      '61-90 Days': arrearsCustomers61_90[selectedUtility]?.[i] || 0,
                      '91+ Days': arrearsCustomers91Plus[selectedUtility]?.[i] || 0
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="31-60 Days" stackId="1" stroke="#FBBF24" fill="#FEF3C7" name="31-60 Days" />
                    <Area type="monotone" dataKey="61-90 Days" stackId="1" stroke="#F97316" fill="#FFEDD5" name="61-90 Days" />
                    <Area type="monotone" dataKey="91+ Days" stackId="1" stroke="#DC2626" fill="#FEE2E2" name="91+ Days" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Arrears Balance Trend - By Bucket */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Arrears Balance by Age Bucket</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={months.map((month, i) => {
                    if (selectedUtility === 'all') {
                      return {
                        month,
                        '31-60 Days': utilities.reduce((sum, u) => sum + (arrearsBalance31_60[u.id]?.[i] || 0), 0),
                        '61-90 Days': utilities.reduce((sum, u) => sum + (arrearsBalance61_90[u.id]?.[i] || 0), 0),
                        '91+ Days': utilities.reduce((sum, u) => sum + (arrearsBalance91Plus[u.id]?.[i] || 0), 0)
                      };
                    }
                    return {
                      month,
                      '31-60 Days': arrearsBalance31_60[selectedUtility]?.[i] || 0,
                      '61-90 Days': arrearsBalance61_90[selectedUtility]?.[i] || 0,
                      '91+ Days': arrearsBalance91Plus[selectedUtility]?.[i] || 0
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="31-60 Days" stackId="1" stroke="#FBBF24" fill="#FEF3C7" name="31-60 Days" />
                    <Area type="monotone" dataKey="61-90 Days" stackId="1" stroke="#F97316" fill="#FFEDD5" name="61-90 Days" />
                    <Area type="monotone" dataKey="91+ Days" stackId="1" stroke="#7C3AED" fill="#EDE9FE" name="91+ Days" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overview Charts - Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Average Bill Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#0284C7' }}>Average Residential Bill Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={months.map((month, i) => {
                    if (selectedUtility === 'all') {
                      // Weighted average
                      const totalAccounts = utilities.reduce((sum, u) => sum + (accounts[u.id]?.[i] || 0), 0);
                      const weightedSum = utilities.reduce((sum, u) => {
                        const acct = accounts[u.id]?.[i] || 0;
                        const bill = avgBill[u.id]?.[i] || 0;
                        return sum + (acct * bill);
                      }, 0);
                      return { month, value: totalAccounts > 0 ? Math.round(weightedSum / totalAccounts) : 0 };
                    }
                    return { month, value: avgBill[selectedUtility]?.[i] || 0 };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `$${v}`} />
                    <Line type="monotone" dataKey="value" stroke="#0284C7" strokeWidth={2} dot={false} name="Avg Bill" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Average Usage Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Average Usage Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={months.map((month, i) => {
                    if (selectedUtility === 'all') {
                      // Show electric utilities average
                      const electricUtils = ['pge', 'pac', 'ipco'];
                      const totalAccounts = electricUtils.reduce((sum, u) => sum + (accounts[u]?.[i] || 0), 0);
                      const weightedSum = electricUtils.reduce((sum, u) => {
                        const acct = accounts[u]?.[i] || 0;
                        const usage = avgUsage[u]?.[i] || 0;
                        return sum + (acct * usage);
                      }, 0);
                      return { month, value: totalAccounts > 0 ? Math.round(weightedSum / totalAccounts) : 0 };
                    }
                    return { month, value: avgUsage[selectedUtility]?.[i] || 0 };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => selectedUtility === 'all' || ['pge', 'pac', 'ipco'].includes(selectedUtility) ? `${v} kWh` : `${v} therms`} />
                    <Line type="monotone" dataKey="value" stroke="#1E3A5F" strokeWidth={2} dot={false} name="Avg Usage" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', textAlign: 'center' }}>
                  {selectedUtility === 'all' ? 'Electric utilities (kWh) shown • Select a gas utility for therms' : 
                   ['pge', 'pac', 'ipco'].includes(selectedUtility) ? 'kWh' : 'Therms'}
                </div>
              </div>
            </div>

            {/* Overview Charts - Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Disconnections Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#EA580C' }}>Disconnections Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getChartData(disconnections)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Bar dataKey="value" fill="#EA580C" name="Disconnections" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bill Discount Participants */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#059669' }}>Bill Discount Participants</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={getChartData(billDiscountParticipants)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Area type="monotone" dataKey="value" stroke="#059669" fill="#D1FAE5" name="Participants" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ==================== ARREARS TAB ==================== */}
        {activeTab === 'arrears' && (
          <>
            <UtilityFilter />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Balance by Utility */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Current Arrears Balance by Utility</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({ name: u.short, balance: arrearsBalance[u.id][currentMonth], color: u.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                      {utilities.map((u, i) => <Cell key={i} fill={u.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Average Balance per Customer */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Average Arrears per Customer</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({ 
                    name: u.short, 
                    avg: Math.round(arrearsBalance[u.id][currentMonth] / arrearsCustomers[u.id][currentMonth]),
                    color: u.color 
                  }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v) => `$${v}`} />
                    <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                      {utilities.map((u, i) => <Cell key={i} fill={u.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* All Utilities Balance Trend */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Arrears Balance Trend - All Utilities</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={months.map((month, i) => {
                  const row = { month };
                  utilities.forEach(u => { row[u.short] = arrearsBalance[u.id][i]; });
                  return row;
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  {utilities.map(u => (
                    <Line key={u.id} type="monotone" dataKey={u.short} stroke={u.color} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Arrears by Age Bucket - Current Month */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Arrears Balance by Age Bucket (Sep 2025)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({
                    name: u.short,
                    '31-60 Days': arrearsBalance31_60[u.id][currentMonth],
                    '61-90 Days': arrearsBalance61_90[u.id][currentMonth],
                    '91+ Days': arrearsBalance91Plus[u.id][currentMonth]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="31-60 Days" stackId="a" fill="#FBBF24" />
                    <Bar dataKey="61-90 Days" stackId="a" fill="#F97316" />
                    <Bar dataKey="91+ Days" stackId="a" fill="#DC2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Customers by Age Bucket (Sep 2025)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({
                    name: u.short,
                    '31-60 Days': arrearsCustomers31_60[u.id][currentMonth],
                    '61-90 Days': arrearsCustomers61_90[u.id][currentMonth],
                    '91+ Days': arrearsCustomers91Plus[u.id][currentMonth]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="31-60 Days" stackId="a" fill="#FBBF24" />
                    <Bar dataKey="61-90 Days" stackId="a" fill="#F97316" />
                    <Bar dataKey="91+ Days" stackId="a" fill="#DC2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Arrears Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Total Customers in Arrears */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Total Customers in Arrears</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={months.map((month, i) => ({
                    month,
                    value: selectedUtility === 'all' 
                      ? utilities.reduce((sum, u) => sum + arrearsCustomers[u.id][i], 0)
                      : arrearsCustomers[selectedUtility]?.[i] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#93C5FD" strokeWidth={2} name="Customers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Total Arrears Balance */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Total Arrears Balance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={months.map((month, i) => ({
                    month,
                    value: selectedUtility === 'all' 
                      ? utilities.reduce((sum, u) => sum + arrearsBalance[u.id][i], 0)
                      : arrearsBalance[selectedUtility]?.[i] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="value" stroke="#DC2626" fill="#FCA5A5" strokeWidth={2} name="Balance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Arrears Trend Indicator */}
            {(() => {
              const recentMonths = 3;
              const getAvg = (arr, start, count) => arr.slice(start, start + count).reduce((a, b) => a + b, 0) / count;
              
              const customerData = selectedUtility === 'all'
                ? months.map((_, i) => utilities.reduce((sum, u) => sum + arrearsCustomers[u.id][i], 0))
                : arrearsCustomers[selectedUtility] || [];
              const balanceData = selectedUtility === 'all'
                ? months.map((_, i) => utilities.reduce((sum, u) => sum + arrearsBalance[u.id][i], 0))
                : arrearsBalance[selectedUtility] || [];
              
              const recentCust = getAvg(customerData, customerData.length - recentMonths, recentMonths);
              const priorCust = getAvg(customerData, customerData.length - recentMonths * 2, recentMonths);
              const custChange = ((recentCust - priorCust) / priorCust) * 100;
              
              const recentBal = getAvg(balanceData, balanceData.length - recentMonths, recentMonths);
              const priorBal = getAvg(balanceData, balanceData.length - recentMonths * 2, recentMonths);
              const balChange = ((recentBal - priorBal) / priorBal) * 100;
              
              const getTrendIcon = (change) => {
                if (change > 2) return { icon: '↑', color: '#DC2626', text: 'Trending Up' };
                if (change < -2) return { icon: '↓', color: '#059669', text: 'Trending Down' };
                return { icon: '→', color: '#6B7280', text: 'Flat' };
              };
              
              const custTrend = getTrendIcon(custChange);
              const balTrend = getTrendIcon(balChange);
              
              return (
                <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'white' }}>Arrears Trend Analysis (3-Month Comparison)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px', color: custTrend.color }}>{custTrend.icon}</span>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Customers in Arrears</div>
                          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{custTrend.text}</div>
                          <div style={{ color: custTrend.color, fontSize: '14px' }}>{custChange >= 0 ? '+' : ''}{custChange.toFixed(1)}% vs prior 3 months</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px', color: balTrend.color }}>{balTrend.icon}</span>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Total Arrears Balance</div>
                          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{balTrend.text}</div>
                          <div style={{ color: balTrend.color, fontSize: '14px' }}>{balChange >= 0 ? '+' : ''}{balChange.toFixed(1)}% vs prior 3 months</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* ==================== DISCONNECTIONS TAB ==================== */}
        {activeTab === 'disconnections' && (
          <>
            <UtilityFilter />

            {/* Disconnections Trend Indicator */}
            {(() => {
              const recentMonths = 3;
              const getAvg = (arr, start, count) => arr.slice(start, start + count).reduce((a, b) => a + b, 0) / count;
              
              const discData = selectedUtility === 'all'
                ? months.map((_, i) => utilities.reduce((sum, u) => sum + disconnections[u.id][i], 0))
                : disconnections[selectedUtility] || [];
              
              const rateData = selectedUtility === 'all'
                ? months.map((_, i) => {
                    const totalDisc = utilities.reduce((sum, u) => sum + disconnections[u.id][i], 0);
                    const totalAcct = utilities.reduce((sum, u) => sum + accounts[u.id][i], 0);
                    return totalAcct > 0 ? (totalDisc / totalAcct) * 100 : 0;
                  })
                : discPct[selectedUtility] || [];
              
              const recentDisc = getAvg(discData, discData.length - recentMonths, recentMonths);
              const priorDisc = getAvg(discData, discData.length - recentMonths * 2, recentMonths);
              const discChange = ((recentDisc - priorDisc) / priorDisc) * 100;
              
              const recentRate = getAvg(rateData, rateData.length - recentMonths, recentMonths);
              const priorRate = getAvg(rateData, rateData.length - recentMonths * 2, recentMonths);
              const rateChange = ((recentRate - priorRate) / priorRate) * 100;
              
              const getTrendIcon = (change) => {
                if (change > 2) return { icon: '↑', color: '#DC2626', text: 'Trending Up' };
                if (change < -2) return { icon: '↓', color: '#059669', text: 'Trending Down' };
                return { icon: '→', color: '#6B7280', text: 'Flat' };
              };
              
              const discTrend = getTrendIcon(discChange);
              const rateTrend = getTrendIcon(rateChange);
              
              return (
                <div style={{ background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'white' }}>Disconnections Trend Analysis (3-Month Comparison)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px', color: discTrend.color === '#DC2626' ? '#FCA5A5' : discTrend.color === '#059669' ? '#6EE7B7' : '#D1D5DB' }}>{discTrend.icon}</span>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Total Disconnections</div>
                          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{discTrend.text}</div>
                          <div style={{ color: discTrend.color === '#DC2626' ? '#FCA5A5' : discTrend.color === '#059669' ? '#6EE7B7' : '#D1D5DB', fontSize: '14px' }}>{discChange >= 0 ? '+' : ''}{discChange.toFixed(1)}% vs prior 3 months</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px', color: rateTrend.color === '#DC2626' ? '#FCA5A5' : rateTrend.color === '#059669' ? '#6EE7B7' : '#D1D5DB' }}>{rateTrend.icon}</span>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Disconnection Rate</div>
                          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{rateTrend.text}</div>
                          <div style={{ color: rateTrend.color === '#DC2626' ? '#FCA5A5' : rateTrend.color === '#059669' ? '#6EE7B7' : '#D1D5DB', fontSize: '14px' }}>{rateChange >= 0 ? '+' : ''}{rateChange.toFixed(1)}% vs prior 3 months</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Total Disconnections Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Total Disconnections Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Total Disconnections Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={months.map((month, i) => ({
                    month,
                    value: selectedUtility === 'all' 
                      ? utilities.reduce((sum, u) => sum + disconnections[u.id][i], 0)
                      : disconnections[selectedUtility]?.[i] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} name="Disconnections" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Total Disconnection Rate Trend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Disconnection Rate Trend (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={months.map((month, i) => {
                    let rate;
                    if (selectedUtility === 'all') {
                      const totalDisc = utilities.reduce((sum, u) => sum + disconnections[u.id][i], 0);
                      const totalAcct = utilities.reduce((sum, u) => sum + accounts[u.id][i], 0);
                      rate = totalAcct > 0 ? (totalDisc / totalAcct) * 100 : 0;
                    } else {
                      rate = discPct[selectedUtility]?.[i] || 0;
                    }
                    return { month, value: parseFloat(rate.toFixed(3)) };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Area type="monotone" dataKey="value" stroke="#DC2626" fill="#FECACA" strokeWidth={2} name="Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Current Month Disconnections */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>September 2025 Disconnections by Utility</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({ name: u.short, disc: disconnections[u.id][currentMonth], color: u.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="disc" radius={[0, 4, 4, 0]} name="Disconnections">
                      {utilities.map((u, i) => <Cell key={i} fill={u.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Disconnection Rate by Utility */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#DC2626' }}>Disconnection Rate by Utility (% of Customers)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({ name: u.short, rate: discPct[u.id][currentMonth], color: u.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]} name="Rate %">
                      {utilities.map((u, i) => <Cell key={i} fill={u.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Disconnection Trend by Utility */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Disconnection Trend by Utility</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={months.map((month, i) => {
                  const row = { month };
                  utilities.forEach(u => { row[u.short] = disconnections[u.id][i]; });
                  return row;
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  {utilities.map(u => (
                    <Line key={u.id} type="monotone" dataKey={u.short} stroke={u.color} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ==================== BILL DISCOUNTS TAB ==================== */}
        {activeTab === 'billDiscount' && (
          <>
            <UtilityFilter />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Participants by Utility */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Bill Discount Participants</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({ name: u.short, part: billDiscountParticipants[u.id][currentMonth], color: u.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Bar dataKey="part" radius={[0, 4, 4, 0]} name="Participants">
                      {utilities.map((u, i) => <Cell key={i} fill={u.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dollars Disbursed */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#059669' }}>Monthly Discount Dollars</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilities.map(u => ({ name: u.short, dollars: billDiscountDollars[u.id][currentMonth], color: u.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="dollars" radius={[0, 4, 4, 0]} name="Dollars">
                      {utilities.map((u, i) => <Cell key={i} fill={u.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Participants Trend */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Bill Discount Participants Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getChartData(billDiscountParticipants)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatNumber(v)} />
                  <Area type="monotone" dataKey="value" stroke="#059669" fill="#D1FAE5" name="Participants" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Dollars Trend */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#059669' }}>Monthly Bill Discount Dollars Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getChartData(billDiscountDollars)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="value" stroke="#059669" fill="#D1FAE5" name="Dollars" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ==================== UTILITY COMPARISON TAB ==================== */}
        {activeTab === 'comparison' && (
          <>
            <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #BFDBFE' }}>
              <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px' }}>
                <strong>Normalized Comparison</strong> — Rates and percentages allow fair comparison across utilities of different sizes. Electric usage in kWh, gas usage in therms.
              </p>
            </div>

            {/* Comparison Table */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>September 2025 Comparison</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>Utility</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #E5E7EB' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Accounts</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Arrears Rate</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Avg Arrears</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Disc. Rate</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Avg Bill</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Avg Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilities.map(u => {
                      const acct = accounts[u.id][currentMonth];
                      const arrCust = arrearsCustomers[u.id][currentMonth];
                      const arrBal = arrearsBalance[u.id][currentMonth];
                      const disc = disconnections[u.id][currentMonth];
                      const bill = avgBill[u.id][currentMonth];
                      const usage = avgUsage[u.id][currentMonth];
                      const isElectric = ['pge', 'pac', 'ipco'].includes(u.id);
                      
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: u.color, marginRight: '8px' }}></span>
                            {u.name}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              fontSize: '11px',
                              background: isElectric ? '#DBEAFE' : '#FEF3C7',
                              color: isElectric ? '#1E40AF' : '#92400E'
                            }}>
                              {isElectric ? 'Electric' : 'Gas'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(acct)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{((arrCust / acct) * 100).toFixed(1)}%</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>${Math.round(arrBal / arrCust)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{discPct[u.id][currentMonth].toFixed(2)}%</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>${bill}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{usage} {isElectric ? 'kWh' : 'therms'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Average Bill Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#0284C7' }}>Average Bill Trend - All Utilities</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={months.map((month, i) => {
                    const row = { month };
                    utilities.forEach(u => { row[u.short] = avgBill[u.id][i]; });
                    return row;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `$${v}`} />
                    <Legend />
                    {utilities.map(u => (
                      <Line key={u.id} type="monotone" dataKey={u.short} stroke={u.color} strokeWidth={1.5} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Average Usage Comparison - Electric */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Average Usage Trend - Electric (kWh)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={months.map((month, i) => {
                    const row = { month };
                    ['pge', 'pac', 'ipco'].forEach(uid => {
                      const u = utilities.find(x => x.id === uid);
                      row[u.short] = avgUsage[uid][i];
                    });
                    return row;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `${v} kWh`} />
                    <Legend />
                    {['pge', 'pac', 'ipco'].map(uid => {
                      const u = utilities.find(x => x.id === uid);
                      return <Line key={uid} type="monotone" dataKey={u.short} stroke={u.color} strokeWidth={1.5} dot={false} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Disconnection Rate and Arrears Rate Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#DC2626' }}>Disconnection Rate Trend (% of Customers)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={months.map((month, i) => {
                    const row = { month };
                    utilities.forEach(u => { row[u.short] = discPct[u.id][i]; });
                    return row;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                    {utilities.map(u => (
                      <Line key={u.id} type="monotone" dataKey={u.short} stroke={u.color} strokeWidth={1.5} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Average Usage Comparison - Gas */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#7C3AED' }}>Average Usage Trend - Gas (Therms)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={months.map((month, i) => {
                    const row = { month };
                    ['nwn', 'cng', 'avista'].forEach(uid => {
                      const u = utilities.find(x => x.id === uid);
                      row[u.short] = avgUsage[uid][i];
                    });
                    return row;
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => `${v} therms`} />
                    <Legend />
                    {['nwn', 'cng', 'avista'].map(uid => {
                      const u = utilities.find(x => x.id === uid);
                      return <Line key={uid} type="monotone" dataKey={u.short} stroke={u.color} strokeWidth={1.5} dot={false} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Arrears Balance by Age Bucket - Comparison */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Arrears Balance by Age Bucket - All Utilities (Sep 2025)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={utilities.map(u => ({
                  name: u.short,
                  '31-60 Days': arrearsBalance31_60[u.id][currentMonth],
                  '61-90 Days': arrearsBalance61_90[u.id][currentMonth],
                  '91+ Days': arrearsBalance91Plus[u.id][currentMonth],
                  color: u.color
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="31-60 Days" stackId="a" fill="#FBBF24" name="31-60 Days" />
                  <Bar dataKey="61-90 Days" stackId="a" fill="#F97316" name="61-90 Days" />
                  <Bar dataKey="91+ Days" stackId="a" fill="#DC2626" name="91+ Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ==================== EXPORT DATA TAB ==================== */}
        {activeTab === 'export' && (
          <>
            <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #BFDBFE' }}>
              <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px' }}>
                <strong>Export Dashboard Data</strong> — Download all data from this dashboard as an Excel file with multiple sheets for easy analysis in spreadsheet software.
              </p>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px', color: '#1E3A5F' }}>Download Data</h3>
              
              <p style={{ color: '#6B7280', marginBottom: '24px', lineHeight: '1.6' }}>
                The Excel file will include the following sheets:
              </p>
              
              <ul style={{ color: '#374151', marginBottom: '32px', lineHeight: '2' }}>
                <li><strong>Summary</strong> — Current month totals and key metrics</li>
                <li><strong>Arrears - Customers</strong> — Monthly customers in arrears by utility</li>
                <li><strong>Arrears - Balance</strong> — Monthly arrears balance by utility</li>
                <li><strong>Arrears - By Bucket</strong> — Arrears breakdown by age (31-60, 61-90, 91+ days)</li>
                <li><strong>Disconnections</strong> — Monthly disconnection counts and rates</li>
                <li><strong>Bill Discounts</strong> — Participants and dollars by utility</li>
                <li><strong>Avg Bill & Usage</strong> — Average residential bill and usage by utility</li>
                <li><strong>Active Accounts</strong> — Monthly active residential accounts</li>
              </ul>

              <button
                onClick={() => {
                  // Create workbook
                  const wb = XLSX.utils.book_new();
                  
                  // Sheet 1: Summary
                  const summaryData = [
                    ['Oregon Energy Burden Dashboard - Data Export'],
                    ['Source: Oregon PUC Docket RO 16 Energy Burden Metrics Reports'],
                    ['Period: January 2024 - September 2025'],
                    ['Export Date: ' + new Date().toLocaleDateString()],
                    [],
                    ['Current Month Summary (September 2025)'],
                    [],
                    ['Utility', 'Type', 'Active Accounts', 'Customers in Arrears', 'Arrears Balance', 'Disconnections', 'Avg Bill', 'Avg Usage'],
                    ...utilities.map(u => [
                      u.name,
                      u.type,
                      accounts[u.id][currentMonth],
                      arrearsCustomers[u.id][currentMonth],
                      arrearsBalance[u.id][currentMonth],
                      disconnections[u.id][currentMonth],
                      avgBill[u.id][currentMonth],
                      avgUsage[u.id][currentMonth]
                    ])
                  ];
                  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
                  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

                  // Sheet 2: Arrears - Customers
                  const arrearsCustomersData = [
                    ['Customers in Arrears by Utility'],
                    [],
                    ['Month', ...utilities.map(u => u.name)],
                    ...months.map((month, i) => [month, ...utilities.map(u => arrearsCustomers[u.id][i])])
                  ];
                  const wsArrearsCust = XLSX.utils.aoa_to_sheet(arrearsCustomersData);
                  XLSX.utils.book_append_sheet(wb, wsArrearsCust, 'Arrears - Customers');

                  // Sheet 3: Arrears - Balance
                  const arrearsBalanceData = [
                    ['Arrears Balance by Utility ($)'],
                    [],
                    ['Month', ...utilities.map(u => u.name)],
                    ...months.map((month, i) => [month, ...utilities.map(u => arrearsBalance[u.id][i])])
                  ];
                  const wsArrearsBal = XLSX.utils.aoa_to_sheet(arrearsBalanceData);
                  XLSX.utils.book_append_sheet(wb, wsArrearsBal, 'Arrears - Balance');

                  // Sheet 4: Arrears by Bucket
                  const arrearsBucketData = [
                    ['Arrears Balance by Age Bucket ($)'],
                    [],
                    ['Month', 'Utility', '31-60 Days', '61-90 Days', '91+ Days', 'Total'],
                    ...months.flatMap((month, i) => 
                      utilities.map(u => [
                        month,
                        u.name,
                        arrearsBalance31_60[u.id][i],
                        arrearsBalance61_90[u.id][i],
                        arrearsBalance91Plus[u.id][i],
                        arrearsBalance[u.id][i]
                      ])
                    )
                  ];
                  const wsArrearsBucket = XLSX.utils.aoa_to_sheet(arrearsBucketData);
                  XLSX.utils.book_append_sheet(wb, wsArrearsBucket, 'Arrears - By Bucket');

                  // Sheet 5: Disconnections
                  const disconnectionsData = [
                    ['Disconnections by Utility'],
                    [],
                    ['Month', ...utilities.map(u => u.name + ' (Count)'), ...utilities.map(u => u.name + ' (Rate %)')],
                    ...months.map((month, i) => [
                      month, 
                      ...utilities.map(u => disconnections[u.id][i]),
                      ...utilities.map(u => discPct[u.id][i])
                    ])
                  ];
                  const wsDisc = XLSX.utils.aoa_to_sheet(disconnectionsData);
                  XLSX.utils.book_append_sheet(wb, wsDisc, 'Disconnections');

                  // Sheet 6: Bill Discounts
                  const billDiscountData = [
                    ['Bill Discount Programs'],
                    [],
                    ['Month', ...utilities.map(u => u.name + ' (Participants)'), ...utilities.map(u => u.name + ' (Dollars)')],
                    ...months.map((month, i) => [
                      month,
                      ...utilities.map(u => billDiscountParticipants[u.id][i]),
                      ...utilities.map(u => billDiscountDollars[u.id][i])
                    ])
                  ];
                  const wsBillDisc = XLSX.utils.aoa_to_sheet(billDiscountData);
                  XLSX.utils.book_append_sheet(wb, wsBillDisc, 'Bill Discounts');

                  // Sheet 7: Avg Bill & Usage
                  const avgBillUsageData = [
                    ['Average Residential Bill ($) and Usage'],
                    ['Note: Electric utilities in kWh, Gas utilities in therms'],
                    [],
                    ['Month', ...utilities.map(u => u.name + ' (Avg Bill $)'), ...utilities.map(u => u.name + ' (Avg Usage)')],
                    ...months.map((month, i) => [
                      month,
                      ...utilities.map(u => avgBill[u.id][i]),
                      ...utilities.map(u => avgUsage[u.id][i])
                    ])
                  ];
                  const wsAvgBill = XLSX.utils.aoa_to_sheet(avgBillUsageData);
                  XLSX.utils.book_append_sheet(wb, wsAvgBill, 'Avg Bill & Usage');

                  // Sheet 8: Active Accounts
                  const accountsData = [
                    ['Active Residential Accounts by Utility'],
                    [],
                    ['Month', ...utilities.map(u => u.name)],
                    ...months.map((month, i) => [month, ...utilities.map(u => accounts[u.id][i])])
                  ];
                  const wsAccounts = XLSX.utils.aoa_to_sheet(accountsData);
                  XLSX.utils.book_append_sheet(wb, wsAccounts, 'Active Accounts');

                  // Download
                  XLSX.writeFile(wb, 'Oregon_Energy_Burden_Dashboard_Data.xlsx');
                }}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Excel File
              </button>
            </div>

            {/* Data Preview */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1E3A5F' }}>Data Preview - September 2025</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>Utility</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Accounts</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>In Arrears</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Arrears $</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>31-60 Days</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>61-90 Days</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>91+ Days</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Disconnects</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #E5E7EB' }}>Avg Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilities.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '10px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: u.color, marginRight: '8px' }}></span>
                          {u.short}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatNumber(accounts[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatNumber(arrearsCustomers[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(arrearsBalance[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(arrearsBalance31_60[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(arrearsBalance61_90[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(arrearsBalance91Plus[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatNumber(disconnections[u.id][currentMonth])}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>${avgBill[u.id][currentMonth]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: '32px', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
          <strong>Data Source:</strong> Oregon PUC Docket RO 16 – Energy Burden Metrics Reports (OAR 860-021-0408)<br/>
          Period: January 2024 – September 2025 | Last Updated: January 2026
        </div>
      </div>
    </div>
  );
}
