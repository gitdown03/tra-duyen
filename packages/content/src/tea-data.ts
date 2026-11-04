import { CosmeticItem } from '@tra-duyen/contracts';

export interface TeaVariety {
  id: string;
  name: string;
  pinyin: string;
  aromaProfile: string;
  description: string;
  recommendedTopic: string;
}

export const TEA_VARIETIES: TeaVariety[] = [
  {
    id: 'tea_long_tinh',
    name: 'Tây Hồ Long Tỉnh',
    pinyin: 'Xī Hú Lóng Jǐng',
    aromaProfile: 'Hương hạt dẻ dịu nhẹ, sắc xanh biếc như ngọc',
    description: 'Danh trà nức tiếng đất Hàng Châu, vị ngọt hậu thanh tao, thích hợp cho buổi sơ ngộ đạm bạc mà sâu sắc.',
    recommendedTopic: 'Ấn tượng ban đầu & Thói quen lúc thảnh thơi'
  },
  {
    id: 'tea_thiet_quan_am',
    name: 'An Khê Thiết Quan Âm',
    pinyin: 'Ān Xī Tiě Guān Yīn',
    aromaProfile: 'Hương hoa lan quyến rũ, vị đượm đà qua bảy nước',
    description: 'Trà Ô Long danh tiếng, càng uống càng đằm, gợi mở những tâm sự về chí hướng và tính cách kiên định.',
    recommendedTopic: 'Mục tiêu cuộc sống & Cách đối diện phong ba'
  },
  {
    id: 'tea_dai_hong_bao',
    name: 'Vũ Di Đại Hồng Bào',
    pinyin: 'Wǔ Yí Dà Hóng Páo',
    aromaProfile: 'Hương khói ấm nồng, hậu vị khoáng thạch cổ xưa',
    description: 'Bảo vật vách đá Vũ Di, vị nồng ấm xua tan giá lạnh, thích hợp khi đàm luận về những kỷ niệm khó quên.',
    recommendedTopic: 'Những khoảnh khắc định hình nên con người bạn'
  },
  {
    id: 'tea_pho_nhi',
    name: 'Vân Nam Phổ Nhĩ Cổ Thụ',
    pinyin: 'Yún Nán Pǔ Ěr',
    aromaProfile: 'Màu đỏ sẫm như hổ phách, trầm hương lắng đọng',
    description: 'Trà bánh lên men lâu năm, mộc mạc và chân thành, dẫn lối cho những sẻ chia về gia đình và bến đỗ bình yên.',
    recommendedTopic: 'Quan niệm về gia đình & Không gian sống lý tưởng'
  },
  {
    id: 'tea_bach_hao_ngan_cham',
    name: 'Bạch Hào Ngân Châm',
    pinyin: 'Bái Háo Yín Zhēn',
    aromaProfile: 'Sương sớm mong manh, ngọt mát như giọt mưa xuân',
    description: 'Búp trà phủ lớp lông tơ bạc trắng, thanh khiết tuyệt trần, tựa như những rung cảm tinh khôi thuở ban đầu.',
    recommendedTopic: 'Những điều giản dị khiến trái tim bạn rung động'
  },
  {
    id: 'tea_bich_loa_xuan',
    name: 'Động Đình Bích Loa Xuân',
    pinyin: 'Bì Luó Chūn',
    aromaProfile: 'Hương hoa trái đồng nội ngào ngạt, lá xoăn như ốc ngọc',
    description: 'Hái giữa rừng hoa trái mùa xuân Động Đình, sinh động và vui tươi, gợi ý những chuyến du ngoạn bốn phương.',
    recommendedTopic: 'Sở thích du ngoạn, ẩm thực và những miền đất ước mơ'
  }
];

export interface PastryItem {
  id: string;
  name: string;
  flavor: string;
  description: string;
  teaPairingNote: string;
}

export const PASTRY_ITEMS: PastryItem[] = [
  {
    id: 'pastry_hoa_mai',
    name: 'Bánh Đậu Xanh Hoa Mai',
    flavor: 'Ngọt bùi thanh thoát, hoa mai đượm nét xuân',
    description: 'Bánh in khuôn hoa mai ngũ giác, tan ngay nơi đầu lưỡi.',
    teaPairingNote: 'Hợp nhất với Tây Hồ Long Tỉnh.'
  },
  {
    id: 'pastry_que_hoa',
    name: 'Thạch Quế Hoa Hoàng Kim',
    flavor: 'Thơm ngát mùi hoa mộc, óng ánh sắc vàng',
    description: 'Thạch trong veo điểm xuyết những cánh hoa mộc tê thơm lừng.',
    teaPairingNote: 'Hợp với An Khê Thiết Quan Âm.'
  },
  {
    id: 'pastry_sen_hong',
    name: 'Điểm Tâm Cánh Sen Hồng',
    flavor: 'Vị bùi của hạt sen tươi, thơm ngát hồ sen',
    description: 'Vỏ bánh xếp tầng như đóa sen đang hé nở.',
    teaPairingNote: 'Hợp với Bạch Hào Ngân Châm.'
  },
  {
    id: 'pastry_ha_cao_ngoc',
    name: 'Bánh Mật Phù Dung Ngọc Bích',
    flavor: 'Dẻo mềm mát lành, nhân táo đỏ hạt óc chó',
    description: 'Viên bánh màu xanh ngọc bích điểm mật ong hoa rừng.',
    teaPairingNote: 'Hợp với Bích Loa Xuân.'
  },
  {
    id: 'pastry_phu_dung',
    name: 'Bánh Ngàn Lớp Phù Dung',
    flavor: 'Giòn xốp bên ngoài, nhân đậu đỏ nhuyễn mịn',
    description: 'Từng lớp bột mỏng tang xếp lớp tạo hình hoa phù dung kiêu sa.',
    teaPairingNote: 'Hợp với Vũ Di Đại Hồng Bào.'
  },
  {
    id: 'pastry_thach_quy_linh',
    name: 'Thạch Quy Linh Mật Phong',
    flavor: 'Thảo mộc thanh nhiệt, vị đắng dịu quyện mật ong',
    description: 'Món tráng miệng dưỡng sinh cổ truyền trứ danh.',
    teaPairingNote: 'Hợp với Vân Nam Phổ Nhĩ.'
  },
  {
    id: 'pastry_manh_ha',
    name: 'Bánh Trà Xanh Bạc Hà',
    flavor: 'Mát lạnh sảng khoái, thơm lá trà non',
    description: 'Vị the dịu xua tan mệt nhọc sau ngày dài.',
    teaPairingNote: 'Hợp với Bích Loa Xuân.'
  },
  {
    id: 'pastry_tao_do',
    name: 'Bánh Hấp Táo Đỏ Kỷ Tử',
    flavor: 'Ngọt thanh ấm bụng, dưỡng huyết an thần',
    description: 'Món bánh hấp xốp mềm màu hổ phách dịu mắt.',
    teaPairingNote: 'Hợp với Vũ Di Đại Hồng Bào.'
  },
  {
    id: 'pastry_me_den',
    name: 'Bánh Nướng Vừng Đen Bát Bảo',
    flavor: 'Thơm bùi đậm đà, giòn rụm hạt mè',
    description: 'Chiếc bánh tròn đầy tượng trưng cho sự viên mãn vẹn toàn.',
    teaPairingNote: 'Hợp với Vân Nam Phổ Nhĩ.'
  },
  {
    id: 'pastry_hanh_nhan',
    name: 'Đậu Hũ Hạnh Nhân Sữa Dê',
    flavor: 'Trắng muốt mềm mịn, thơm ngậy hạnh nhân',
    description: 'Mềm như mây, tan nhẹ trong miệng để lại dư vị ngọt thanh.',
    teaPairingNote: 'Hợp với Bạch Hào Ngân Châm.'
  },
  {
    id: 'pastry_tram_huong',
    name: 'Bánh Dẻo Hương Nhài Trăng Tròn',
    flavor: 'Dẻo quánh hương hoa lài ban đêm',
    description: 'Tạo hình vầng trăng rằm, tượng trưng cho hạnh ngộ trùng phùng.',
    teaPairingNote: 'Hợp với Tây Hồ Long Tỉnh.'
  },
  {
    id: 'pastry_mat_cuc',
    name: 'Kẹo Lạc Mật Cúc Họa Mi',
    flavor: 'Giòn bùi hạt lạc rang, thơm phấn hoa cúc',
    description: 'Món kẹo dân dã nhưng tinh tế dùng kèm chén trà đậm vị.',
    teaPairingNote: 'Hợp với An Khê Thiết Quan Âm.'
  }
];

export interface TeaQuestion {
  id: string;
  category: 'SỞ THÍCH' | 'TÍNH CÁCH' | 'LỐI SỐNG' | 'ƯỚC MƠ' | 'GIAO TIẾP';
  text: string;
  suggestedPrompt: string;
}

export const TEA_QUESTIONS: TeaQuestion[] = [
  {
    id: 'q1',
    category: 'SỞ THÍCH',
    text: 'Vào một buổi chiều rảnh rỗi không vướng bận việc gì, bạn sẽ thích làm điều gì nhất?',
    suggestedPrompt: 'Ví dụ: Đọc sách, nấu ăn, đi dạo ngắm phố, nghe nhạc hay nhâm nhi tách trà...'
  },
  {
    id: 'q2',
    category: 'TÍNH CÁCH',
    text: 'Khi gặp chuyện không như ý, bạn thường chọn cách một mình suy ngẫm hay chia sẻ ngay với người thân cận?',
    suggestedPrompt: 'Hãy chia sẻ cách bạn tìm lại sự cân bằng trong tâm hồn.'
  },
  {
    id: 'q3',
    category: 'LỐI SỐNG',
    text: 'Bạn thích nhịp sống yên bình nơi phố thị thanh vắng hay sự nhộn nhịp, sôi động của chốn phồn hoa?',
    suggestedPrompt: 'Mỗi người đều có một nhịp thở riêng phù hợp với mình.'
  },
  {
    id: 'q4',
    category: 'GIAO TIẾP',
    text: 'Điều gì ở người đối diện khiến bạn cảm thấy thoải mái và cởi mở nhất khi trò chuyện?',
    suggestedPrompt: 'Sự hài hước, ánh mắt chân thành, hay khả năng lắng nghe tinh tế?'
  },
  {
    id: 'q5',
    category: 'ƯỚC MƠ',
    text: 'Nếu có cơ hội dành ra trọn vẹn một năm không lo âu, bạn khao khát học thêm kỹ năng hoặc đi đến nơi nào?',
    suggestedPrompt: 'Một giấc mơ thuở nhỏ hay một vùng đất bạn luôn ấp ủ viếng thăm.'
  },
  {
    id: 'q6',
    category: 'SỞ THÍCH',
    text: 'Cuốn sách hoặc tác phẩm nghệ thuật nào gần đây để lại cho bạn dư âm sâu sắc nhất?',
    suggestedPrompt: 'Nội dung hay bài học nào khiến bạn suy ngẫm mãi?'
  },
  {
    id: 'q7',
    category: 'TÍNH CÁCH',
    text: 'Trong mắt những người bạn thân thiết nhất, bạn là người mang lại cảm giác thế nào?',
    suggestedPrompt: 'Ấm áp, đáng tin cậy, hài hước, hay là chỗ dựa bình yên?'
  },
  {
    id: 'q8',
    category: 'LỐI SỐNG',
    text: 'Một ngày cuối tuần trọn vẹn và lý tưởng trong mắt bạn sẽ bắt đầu và kết thúc như thế nào?',
    suggestedPrompt: 'Thức dậy sớm đón bình minh hay ngủ đẫy giấc rồi thưởng thức bữa ăn ngon?'
  },
  {
    id: 'q9',
    category: 'GIAO TIẾP',
    text: 'Khi có bất đồng ý kiến trong một mối quan hệ, bạn thường ưu tiên giải quyết theo cách nào?',
    suggestedPrompt: 'Cho nhau khoảng lặng để bình tâm, hay thẳng thắn đối thoại ngay?'
  },
  {
    id: 'q10',
    category: 'ƯỚC MƠ',
    text: 'Điều gì là kim chỉ nam quan trọng nhất giúp bạn đưa ra những quyết định lớn trong đời?',
    suggestedPrompt: 'Trực giác mách bảo, lý trí phân tích, hay sự đồng cảm với mọi người?'
  },
  {
    id: 'q11',
    category: 'SỞ THÍCH',
    text: 'Món ăn nào gợi cho bạn cảm giác ấm áp và thân thuộc nhất của quê hương hay gia đình?',
    suggestedPrompt: 'Hương vị của ký ức tuổi thơ.'
  },
  {
    id: 'q12',
    category: 'TÍNH CÁCH',
    text: 'Bạn cảm thấy bản thân mình giống với hình tượng nào: Ngọn gió tự do, Dòng suối uốn lượn, hay Ngọn núi vững vàng?',
    suggestedPrompt: 'Một hình ảnh ẩn dụ nói lên cốt cách của bạn.'
  },
  {
    id: 'q13',
    category: 'LỐI SỐNG',
    text: 'Bạn thích tự tay vào bếp chuẩn bị một bữa tiệc ấm cúng hay thích khám phá những hàng quán độc đáo?',
    suggestedPrompt: 'Niềm vui của sự sáng tạo nơi gian bếp hay sự phong phú của thế giới bên ngoài?'
  },
  {
    id: 'q14',
    category: 'GIAO TIẾP',
    text: 'Món quà ý nghĩa nhất bạn từng nhận được hoặc từng trao đi không nằm ở giá trị vật chất là gì?',
    suggestedPrompt: 'Một bức thư tay, một lời động viên đúng lúc, hay một sự hiện diện chân thành?'
  },
  {
    id: 'q15',
    category: 'ƯỚC MƠ',
    text: 'Khi nhìn lại chặng đường đã qua, điều gì khiến bạn tự hào nhất về sự trưởng thành của chính mình?',
    suggestedPrompt: 'Một thử thách đã vượt qua hay sự bao dung mà bạn học được.'
  },
  {
    id: 'q16',
    category: 'SỞ THÍCH',
    text: 'Nếu được chọn nghe một bản nhạc trong đêm thanh vắng, bạn sẽ chọn điệu nhạc trầm bổng của nhạc cụ nào?',
    suggestedPrompt: 'Tiếng đàn tranh trong trẻo, sáo trúc phiêu bồng, hay tiếng dương cầm sâu lắng?'
  },
  {
    id: 'q17',
    category: 'TÍNH CÁCH',
    text: 'Bạn đánh giá cao đức tính nào nhất ở một người bạn đồng hành dài lâu?',
    suggestedPrompt: 'Sự chân thành, lòng thủy chung, khiếu hài hước hay tinh thần trách nhiệm?'
  },
  {
    id: 'q18',
    category: 'LỐI SỐNG',
    text: 'Không gian sống yêu thích của bạn mang màu sắc gì và có những vật dụng trang trí nào?',
    suggestedPrompt: 'Nhiều cây xanh, ánh sáng tự nhiên ngập tràn, hay góc nhỏ ấm cúng tối giản?'
  },
  {
    id: 'q19',
    category: 'GIAO TIẾP',
    text: 'Bạn nghĩ điều gì là quan trọng nhất để giữ cho một mối quan hệ luôn tươi mới qua năm tháng?',
    suggestedPrompt: 'Cùng nhau trải nghiệm điều mới, tôn trọng tự do của nhau, hay giữ gìn những cuộc trò chuyện sâu sắc?'
  },
  {
    id: 'q20',
    category: 'ƯỚC MƠ',
    text: 'Nếu được xây dựng một ngôi nhà theo ý muốn, bạn sẽ đặt nó ở bờ biển, sườn đồi, giữa rừng hay trung tâm đô thị?',
    suggestedPrompt: 'Khung cảnh mỗi sớm mai mở cửa sổ bạn muốn ngắm nhìn.'
  },
  {
    id: 'q21',
    category: 'SỞ THÍCH',
    text: 'Bạn có thích nuôi thú cưng không, và loài động vật nào khiến bạn cảm thấy được an ủi nhất?',
    suggestedPrompt: 'Chú mèo lười thích cuộn tròn hay chú cún trung thành lăng xăng?'
  },
  {
    id: 'q22',
    category: 'TÍNH CÁCH',
    text: 'Khi ai đó khen bạn, bạn thường phản ứng như thế nào?',
    suggestedPrompt: 'Ngượng ngùng mỉm cười, cảm ơn chân thành, hay tìm cách khen lại đối phương?'
  },
  {
    id: 'q23',
    category: 'LỐI SỐNG',
    text: 'Thói quen nhỏ nào mỗi sáng giúp bạn khởi động một ngày mới tràn đầy năng lượng?',
    suggestedPrompt: 'Tập thể dục, uống một ly nước ấm, tưới cây hay nghe một bản nhạc yêu thích?'
  },
  {
    id: 'q24',
    category: 'GIAO TIẾP',
    text: 'Làm thế nào để bạn biết rằng mình đã thực sự coi một người là tri kỷ?',
    suggestedPrompt: 'Khi cả hai ngồi cạnh nhau trong yên lặng mà không hề thấy ngượng ngùng?'
  },
  {
    id: 'q25',
    category: 'ƯỚC MƠ',
    text: 'Một kỹ năng dân dã mà bạn rất muốn được thành thục là gì (ví dụ: cắm hoa, làm gốm, thư pháp, làm bánh)?',
    suggestedPrompt: 'Thú vui tao nhã giúp tâm hồn thư thái.'
  },
  {
    id: 'q26',
    category: 'SỞ THÍCH',
    text: 'Thời tiết nào trong năm mang lại cho bạn nhiều cảm hứng sáng tạo và tâm trạng tốt nhất?',
    suggestedPrompt: 'Mưa rả rích đầu thu, nắng vàng rực rỡ đầu hạ, hay gió lạnh đầu đông?'
  },
  {
    id: 'q27',
    category: 'TÍNH CÁCH',
    text: 'Bạn là người lên kế hoạch chu toàn cho mọi chuyến đi hay thích xách ba lô lên và đi theo ngẫu hứng?',
    suggestedPrompt: 'Sự an tâm của lộ trình chi tiết hay sự bất ngờ của những ngã rẽ tình cờ?'
  },
  {
    id: 'q28',
    category: 'LỐI SỐNG',
    text: 'Cách bạn chăm sóc bản thân sau những ngày làm việc căng thẳng và mệt mỏi là gì?',
    suggestedPrompt: 'Tắt hết thông báo điện thoại, đi spa thư giãn, hay ngủ một giấc thật sâu?'
  },
  {
    id: 'q29',
    category: 'GIAO TIẾP',
    text: 'Nếu có thể gửi một lời cảm ơn đến một người đã từng đi qua cuộc đời bạn, bạn muốn nói điều gì?',
    suggestedPrompt: 'Sự trân trọng những kỷ niệm đẹp đã qua.'
  },
  {
    id: 'q30',
    category: 'ƯỚC MƠ',
    text: 'Trong mười năm tới, hình ảnh người phụ nữ / người đàn ông mà bạn mong muốn trở thành là gì?',
    suggestedPrompt: 'Điềm tĩnh, bao dung, tự do tự tại, hay thành đạt vững vàng?'
  }
];

export interface ScenarioCard {
  id: string;
  title: string;
  context: string;
  dilemma: string;
  optionA: string;
  optionB: string;
  optionC: string;
}

export const SCENARIO_CARDS: ScenarioCard[] = [
  {
    id: 'sc1',
    title: 'Cơn Mưa Rào Bên Mái Hiên Quán Trà',
    context: 'Hai người vừa dạo phố phường thì một cơn mưa rào bất chợt đổ xuống. Cả hai chỉ có một chiếc ô duy nhất.',
    dilemma: 'Cùng che ô về nhà ngay dù có thể bị ướt vai, hay nán lại quán trà nhỏ ven đường ngắm mưa đợi tạnh?',
    optionA: 'Cùng nép vào nhau dưới chiếc ô, vừa đi vừa nói cười mặc gió mưa.',
    optionB: 'Vào quán trà ven đường, gọi hai chén trà nóng nhâm nhi ngắm mưa rơi.',
    optionC: 'Nhường ô cho bạn đi trước, mình đứng đợi hoặc tìm thêm ô che cùng.'
  },
  {
    id: 'sc2',
    title: 'Ngã Rẽ Trong Chuyến Du Ngoạn',
    context: 'Hai người cùng lên đường đi thăm một thắng cảnh nổi tiếng. Đến ngã ba, một đường là lối mòn phẳng lặng an toàn, một đường là con dốc quanh co ngập tràn hoa dại.',
    dilemma: 'Bạn muốn cùng người ấy chọn lối đi nào?',
    optionA: 'Chọn con dốc quanh co hoa dại, thích phiêu lưu và ngắm cảnh sắc độc đáo.',
    optionB: 'Chọn lối mòn phẳng lặng an toàn, thong thả chuyện trò không lo trượt ngã.',
    optionC: 'Thảo luận cùng đối phương, nếu mệt thì đi đường bằng, khỏe thì leo dốc.'
  },
  {
    id: 'sc3',
    title: 'Món Quà Bất Ngờ Nhưng Chưa Đúng Ý',
    context: 'Đối phương cất công chuẩn bị một món quà tặng bạn nhân dịp đặc biệt, nhưng món đồ đó lại không đúng với sở thích thường ngày của bạn.',
    dilemma: 'Bạn sẽ đón nhận và phản hồi thế nào để vừa chân thành vừa không làm tổn thương lòng tốt?',
    optionA: 'Vui vẻ đón nhận tấm lòng, cất giữ cẩn thận và sau này khéo léo tâm sự sở thích sau.',
    optionB: 'Cười tươi cảm ơn chân thành, nói rõ mình rất xúc động vì công sức đối phương dành cho mình.',
    optionC: 'Cảm ơn và thành thật chia sẻ nhẹ nhàng để cả hai hiểu rõ gu của nhau hơn cho lần sau.'
  },
  {
    id: 'sc4',
    title: 'Bữa Tiệc Đông Đúc vs Buổi Trò Chuyện Riêng',
    context: 'Cuối tuần có lời mời tham dự một buổi tiệc nhộn nhịp đông người quen, nhưng cả hai đều vừa trải qua một tuần làm việc khá mệt mỏi.',
    dilemma: 'Bạn sẽ đề xuất cùng đi dự tiệc hay dành thời gian cho nhau?',
    optionA: 'Từ chối bữa tiệc khéo léo, cùng nhau nấu bữa ăn nhẹ và tận hưởng không gian yên tĩnh.',
    optionB: 'Đến dự tiệc chúc mừng một lúc rồi xin phép về sớm để đi dạo.',
    optionC: 'Hỏi ý kiến đối phương xem có muốn đổi gió náo nhiệt không rồi mới quyết định.'
  },
  {
    id: 'sc5',
    title: 'Bất Đồng Về Kế Hoạch Cuối Tuần',
    context: 'Một người muốn ra ngoài khám phá bảo tàng hoặc triển lãm nghệ thuật, một người lại thích ở nhà nghỉ ngơi dọn dẹp và cắm hoa.',
    dilemma: 'Hai bạn sẽ hòa hợp ra sao?',
    optionA: 'Buổi sáng cùng dọn dẹp cắm hoa tại nhà, buổi chiều thong thả đi xem triển lãm.',
    optionB: 'Tuần này làm theo sở thích của một người, tuần sau sẽ ưu tiên người còn lại.',
    optionC: 'Mỗi người dành nửa ngày cho sở thích riêng rồi buổi tối hẹn hò ăn uống.'
  },
  {
    id: 'sc6',
    title: 'Học Thêm Một Kỹ Năng Mới Cùng Nhau',
    context: 'Cả hai muốn đăng ký một lớp học trải nghiệm cuối tuần (học làm gốm Bát Tràng, vẽ tranh màu nước, hay lớp pha trà đạo).',
    dilemma: 'Bạn hào hứng với trải nghiệm nào nhất?',
    optionA: 'Làm gốm - cùng nhau nhào nặn tạo nên chiếc tách đôi kỷ niệm.',
    optionB: 'Pha trà đạo - học cách tĩnh tâm, hiểu về các loại thảo mộc và nghi thức.',
    optionC: 'Vẽ tranh màu nước - cùng phác họa phong cảnh nơi hai người từng gặp gỡ.'
  },
  {
    id: 'sc7',
    title: 'Lạc Đường Nơi Phố Cổ Ban Đêm',
    context: 'Dạo chơi trong những ngõ nhỏ cổ kính, điện thoại hết pin và cả hai nhận ra mình đã lạc khỏi trục đường chính.',
    dilemma: 'Tâm trạng và phản ứng của bạn trong khoảnh khắc đó là gì?',
    optionA: 'Thích thú coi đây là một cuộc thám hiểm bất ngờ, cùng nhau thong thả vừa đi vừa hỏi đường.',
    optionB: 'Bình tĩnh tìm quán nước gần nhất có ánh đèn để mượn sạc hoặc hỏi thăm người dân.',
    optionC: 'Cùng nhìn nhau bật cười vì sự đãng trí đáng yêu và ghi nhớ khoảnh khắc này.'
  },
  {
    id: 'sc8',
    title: 'Khi Một Người Đang Trong Tâm Trạng Trầm Lắng',
    context: 'Trong buổi gặp gỡ, bạn nhận thấy người kia có vẻ trầm ngâm, ít nói hơn thường ngày do áp lực công việc.',
    dilemma: 'Cách bạn thể hiện sự quan tâm là gì?',
    optionA: 'Ngồi yên lặng bên cạnh, rót một tách trà ấm và để đối phương tự nhiên thư giãn.',
    optionB: 'Nhẹ nhàng hỏi han: "Hôm nay có chuyện gì khiến bạn bận lòng không, mình luôn ở đây lắng nghe".',
    optionC: 'Kể một câu chuyện vui vẻ hài hước để giúp người ấy xua tan căng thẳng.'
  },
  {
    id: 'sc9',
    title: 'Chọn Món Ăn Trong Quán Ăn Lạ',
    context: 'Hai người bước vào một quán ăn đặc sản vùng miền với thực đơn toàn những cái tên lạ lẫm chưa từng nghe.',
    dilemma: 'Bạn sẽ chọn cách gọi món thế nào?',
    optionA: 'Nhờ chủ quán giới thiệu hai món đặc trưng nhất của quán.',
    optionB: 'Mỗi người chọn ngẫu nhiên một món thử vận may và cùng san sẻ nếm thử.',
    optionC: 'Chọn một món an toàn quen thuộc và một món hoàn toàn mới lạ để trải nghiệm.'
  },
  {
    id: 'sc10',
    title: 'Món Đồ Kỷ Niệm Cho Chuyến Đi Chung',
    context: 'Trước khi kết thúc một chuyến dã ngoại tuyệt vời, hai người muốn chọn một món đồ nhỏ làm kỷ niệm.',
    dilemma: 'Bạn sẽ chọn thứ gì mang ý nghĩa lâu bền?',
    optionA: 'Một chiếc chuông gió bằng đồng hoặc sứ treo cửa sổ đón gió.',
    optionB: 'Một chậu cây nhỏ xinh cùng nhau chăm sóc lớn lên mỗi ngày.',
    optionC: 'Một tấm bưu thiếp tự tay viết vài dòng cảm xúc gửi về tương lai.'
  },
  {
    id: 'sc11',
    title: 'Thời Gian Dành Cho Bạn Bè Riêng',
    context: 'Đối phương có nhóm bạn thân lâu năm và thường dành một tối trong tuần để gặp gỡ hàn huyên.',
    dilemma: 'Quan điểm của bạn về không gian riêng tư của nhau?',
    optionA: 'Hoàn toàn ủng hộ, mỗi người đều cần có bạn bè và khoảng trời riêng.',
    optionB: 'Rất vui nếu đôi khi được cùng tham gia để làm quen với những người bạn của nhau.',
    optionC: 'Tôn trọng không gian đó và tận dụng tối đó cho sở thích cá nhân của mình.'
  },
  {
    id: 'sc12',
    title: 'Khi Bất Ngờ Nhận Được Tiền Thưởng Lớn',
    context: 'Bạn hoặc đối phương vừa hoàn thành xuất sắc một dự án và nhận được một khoản thưởng hậu hĩnh.',
    dilemma: 'Ý tưởng sử dụng khoản tiền này để tạo niềm vui chung?',
    optionA: 'Tự thưởng một chuyến du lịch ngắn ngày để nạp lại năng lượng.',
    optionB: 'Dành một phần ăn mừng ấm cúng, phần lớn gửi vào quỹ tiết kiệm cho mục tiêu tương lai.',
    optionC: 'Mua sắm một món đồ tiện ích cho gia đình hoặc giúp đỡ người có hoàn cảnh khó khăn.'
  },
  {
    id: 'sc13',
    title: 'Chăm Sóc Một Chú Mèo Hoang Lạc Đến Hiên Nhà',
    context: 'Một chú mèo con lông xù ướt sũng xuất hiện trước hiên nhà trong đêm mưa lạnh.',
    dilemma: 'Hai bạn sẽ xử lý thế nào?',
    optionA: 'Lau khô, cho ăn và quyết định cưu mang nhận nuôi chú mèo.',
    optionB: 'Chăm sóc tạm thời qua đêm rồi tìm trạm cứu hộ hoặc người chủ tốt bụng nhận nuôi.',
    optionC: 'Hỏi han hàng xóm xung quanh xem có ai bị lạc mất thú cưng không trước khi quyết định.'
  },
  {
    id: 'sc14',
    title: 'Cách Trang Trí Cho Mùa Lễ Hội',
    context: 'Tết đến xuân về hoặc mùa lễ hội, hai người cùng bắt tay dọn dẹp và trang hoàng không gian sống.',
    dilemma: 'Phong cách trang trí bạn hướng tới là gì?',
    optionA: 'Truyền thống, ấm cúng với câu đối đỏ, hoa đào/mai và đèn lồng lung linh.',
    optionB: 'Tối giản, hiện đại, điểm xuyết một vài cành hoa tươi thơm mát.',
    optionC: 'Sáng tạo theo sở thích cá nhân, kết hợp những món đồ handmade tự làm.'
  },
  {
    id: 'sc15',
    title: 'Một Lời Hứa Nhỏ Bị Quên Lãng',
    context: 'Đối phương vô tình quên mua món đồ ăn vặt mà bạn đã dặn dò trên đường đi làm về.',
    dilemma: 'Bạn sẽ phản ứng như thế nào?',
    optionA: 'Mỉm cười xua tay: "Không sao đâu, mai mua cũng được, bạn đi làm về mệt rồi".',
    optionB: 'Trêu đùa một chút để đối phương "chuộc lỗi" bằng cách rửa bát hoặc pha trà.',
    optionC: 'Rủ đối phương cùng đi dạo ra đầu ngõ vừa hóng mát vừa mua đồ.'
  },
  {
    id: 'sc16',
    title: 'Giữ Gìn Bí Mật Của Người Khác',
    context: 'Một người bạn thân tâm sự một chuyện thầm kín với bạn và dặn không được kể cho ai, kể cả người yêu.',
    dilemma: 'Bạn ứng xử thế nào trước nguyên tắc tin cậy này?',
    optionA: 'Tuyệt đối giữ kín như đã hứa, tôn trọng niềm tin của người bạn.',
    optionB: 'Giải thích với người yêu rằng đây là bí mật riêng của bạn mình để người ấy thông cảm không gặng hỏi.',
    optionC: 'Khuyên người bạn kia nếu có thể hãy tìm sự chia sẻ rộng hơn từ những người có chuyên môn.'
  },
  {
    id: 'sc17',
    title: 'Thử Thách Nấu Ăn Bằng Những Thứ Còn Lại Trong Tủ Lạnh',
    context: 'Tối muộn đói bụng nhưng trời lạnh ngại ra ngoài, trong tủ chỉ còn vài quả trứng, cà chua và chút mì sợi.',
    dilemma: 'Cùng nhau làm nên điều bất ngờ nơi gian bếp?',
    optionA: 'Cùng trổ tài nấu một bát mì trứng cà chua bốc khói nghi ngút thơm lừng.',
    optionB: 'Biến việc nấu nướng thành trò chơi, mỗi người góp một công đoạn và nếm gia vị.',
    optionC: 'Cùng nhau ăn trong tiếng nhạc êm dịu, thấy bình yên từ những điều giản đơn.'
  },
  {
    id: 'sc18',
    title: 'Viết Thiệp Gửi Người Tương Lai',
    context: 'Tại bàn trà hôm nay, mai mối đưa cho hai người một cánh thiệp đỏ để ghi lại một lời chúc hoặc một tâm nguyện.',
    dilemma: 'Thông điệp bạn muốn khắc ghi nhất là gì?',
    optionA: '"Nguyện cho năm tháng bình yên, người bên cạnh luôn là tri kỷ".',
    optionB: '"Giữ tâm chân thành, duyên lành ắt tự khắc trổ hoa".',
    optionC: '"Mỗi ngày qua đi đều ngập tràn nụ cười và sự thấu hiểu".'
  }
];

export const ROOM_THEMES = [
  {
    id: 'LANTERN_FESTIVAL',
    name: 'Hội Đèn Lồng Trùng Phùng',
    atmosphere: 'Ánh đèn hoa đăng rực rỡ, lụa đỏ treo cao, phong vị lễ hội tươi vui.',
    ambientColor: '#ffe8cc',
    lanternColor: '#ff4d4f'
  },
  {
    id: 'SPRING_TEA',
    name: 'Trà Đầu Xuân Nở Hoa',
    atmosphere: 'Gió xuân mơn man, cành đào khoe sắc, không khí tinh khôi ngập tràn hy vọng.',
    ambientColor: '#f6ffed',
    lanternColor: '#52c41a'
  },
  {
    id: 'MOON_NIGHT',
    name: 'Đêm Thưởng Nguyệt Đàm Đạo',
    atmosphere: 'Trăng rằm vằng vặc, hương hoa quế thoang thoảng, sự tĩnh lặng sâu lắng.',
    ambientColor: '#e6f7ff',
    lanternColor: '#1890ff'
  }
];

export const COSMETIC_CATALOG: CosmeticItem[] = [
  {
    id: 'cos_hair_scholar',
    name: 'Tóc Nho Sinh Búi Ngọc',
    category: 'HAIR',
    description: 'Kiểu tóc búi gọn gàng đính trâm ngọc bích của nho sinh nho nhã.',
    priceLeaves: 0,
    icon: 'icon_hair_scholar',
    modelAssetKey: 'hair_scholar_1',
    isDefault: true
  },
  {
    id: 'cos_hair_maiden',
    name: 'Tóc Song Hoàn Yêu Kiều',
    category: 'HAIR',
    description: 'Mái tóc búi hai bên điểm hoa mai dịu dàng thanh thoát.',
    priceLeaves: 0,
    icon: 'icon_hair_maiden',
    modelAssetKey: 'hair_maiden_1',
    isDefault: true
  },
  {
    id: 'cos_hair_flowing',
    name: 'Tóc Xõa Phong Trần Lãng Tử',
    category: 'HAIR',
    description: 'Mái tóc dài buông xõa nửa đầu phiêu bạt tự do.',
    priceLeaves: 100,
    icon: 'icon_hair_flowing',
    modelAssetKey: 'hair_flowing_1',
    isDefault: false
  },
  {
    id: 'cos_hair_royal',
    name: 'Tóc Vương Các Vương Giả',
    category: 'HAIR',
    description: 'Kiểu tóc vấn cao đính trâm hoàng kim quý phái.',
    priceLeaves: 150,
    icon: 'icon_hair_royal',
    modelAssetKey: 'hair_royal_1',
    isDefault: false
  },
  {
    id: 'cos_outfit_hanfu_scholar',
    name: 'Hán Phục Nho Sinh Lam Sắc',
    category: 'OUTFIT',
    description: 'Áo dài cổ trang màu xanh nhạt thư sinh tao nhã.',
    priceLeaves: 0,
    icon: 'icon_outfit_scholar',
    modelAssetKey: 'robe_hanfu_1',
    isDefault: true
  },
  {
    id: 'cos_outfit_hanfu_pink',
    name: 'Trang Phục Hồng Đào Y Phục',
    category: 'OUTFIT',
    description: 'Áo lụa màu hoa đào nhẹ nhàng duyên dáng.',
    priceLeaves: 0,
    icon: 'icon_outfit_pink',
    modelAssetKey: 'robe_hanfu_2',
    isDefault: true
  },
  {
    id: 'cos_outfit_burgundy',
    name: 'Cổ Trang Chu Sa Thẫm',
    category: 'OUTFIT',
    description: 'Bộ áo lụa chu sa đỏ thẫm quý phái, viền chỉ vàng thêu mây.',
    priceLeaves: 200,
    icon: 'icon_outfit_burgundy',
    modelAssetKey: 'robe_hanfu_3',
    isDefault: false
  },
  {
    id: 'cos_outfit_ink',
    name: 'Mặc Y Thủy Mặc',
    category: 'OUTFIT',
    description: 'Tà áo đen phối trắng tựa bức tranh thủy mặc phong nhã.',
    priceLeaves: 250,
    icon: 'icon_outfit_ink',
    modelAssetKey: 'robe_hanfu_4',
    isDefault: false
  },
  {
    id: 'cos_acc_jade_pendant',
    name: 'Ngọc Bội Bình An',
    category: 'ACCESSORY',
    description: 'Miếng ngọc bội xanh biếc đeo bên hông cầu chúc vạn sự an khang.',
    priceLeaves: 80,
    icon: 'icon_acc_jade',
    modelAssetKey: 'acc_jade_pendant',
    isDefault: false
  },
  {
    id: 'cos_acc_silk_fan',
    name: 'Quạt Lụa Thêu Thủy Trúc',
    category: 'ACCESSORY',
    description: 'Chiếc quạt tròn thêu trúc thanh nhã nơi tay.',
    priceLeaves: 120,
    icon: 'icon_acc_fan',
    modelAssetKey: 'acc_silk_fan',
    isDefault: false
  },
  {
    id: 'cos_acc_tea_gourd',
    name: 'Hồ Lô Trữ Trà Tía',
    category: 'ACCESSORY',
    description: 'Bình hồ lô gốm tử sa nhỏ đeo thắt lưng giữ ấm trà thơm.',
    priceLeaves: 100,
    icon: 'icon_acc_gourd',
    modelAssetKey: 'acc_tea_gourd',
    isDefault: false
  },
  {
    id: 'cos_acc_lantern_pin',
    name: 'Trâm Cài Hoa Đăng Hồng',
    category: 'ACCESSORY',
    description: 'Chiếc trâm hoa đăng tinh xảo lấp lánh như đốm lửa ấm.',
    priceLeaves: 150,
    icon: 'icon_acc_pin',
    modelAssetKey: 'acc_lantern_pin',
    isDefault: false
  }
];

export const APPEARANCE_PRESETS = [
  {
    id: 'preset_default_1',
    name: 'Thanh Phong Nho Sĩ',
    hairStyle: 'hair_scholar_1',
    hairColor: '#201815',
    skinTone: '#f8deb8',
    outfitStyle: 'robe_hanfu_1',
    outfitPalette: 'palette_cyan',
    accessory: 'none',
    defaultExpression: 'gentle'
  },
  {
    id: 'preset_default_2',
    name: 'Đào Hoa Thục Nữ',
    hairStyle: 'hair_maiden_1',
    hairColor: '#1c1715',
    skinTone: '#fdeee0',
    outfitStyle: 'robe_hanfu_2',
    outfitPalette: 'palette_rose',
    accessory: 'none',
    defaultExpression: 'sweet'
  },
  {
    id: 'preset_preset_3',
    name: 'Huyền Y Lãng Khách',
    hairStyle: 'hair_flowing_1',
    hairColor: '#121212',
    skinTone: '#ebd0b0',
    outfitStyle: 'robe_hanfu_4',
    outfitPalette: 'palette_charcoal',
    accessory: 'acc_tea_gourd',
    defaultExpression: 'composed'
  },
  {
    id: 'preset_preset_4',
    name: 'Chu Sa Công Tử',
    hairStyle: 'hair_scholar_1',
    hairColor: '#2b1b17',
    skinTone: '#fae4cd',
    outfitStyle: 'robe_hanfu_3',
    outfitPalette: 'palette_burgundy',
    accessory: 'acc_jade_pendant',
    defaultExpression: 'gentle'
  },
  {
    id: 'preset_preset_5',
    name: 'Bích Ngọc Giai Nhân',
    hairStyle: 'hair_maiden_1',
    hairColor: '#241e1a',
    skinTone: '#fcf0e4',
    outfitStyle: 'robe_hanfu_1',
    outfitPalette: 'palette_jade',
    accessory: 'acc_silk_fan',
    defaultExpression: 'sweet'
  },
  {
    id: 'preset_preset_6',
    name: 'Tử Sa Ẩn Sĩ',
    hairStyle: 'hair_flowing_1',
    hairColor: '#302621',
    skinTone: '#e8cbab',
    outfitStyle: 'robe_hanfu_3',
    outfitPalette: 'palette_purple',
    accessory: 'acc_tea_gourd',
    defaultExpression: 'composed'
  },
  {
    id: 'preset_preset_7',
    name: 'Hoàng Kim Nhã Khách',
    hairStyle: 'hair_royal_1',
    hairColor: '#1f1a17',
    skinTone: '#f7dec0',
    outfitStyle: 'robe_hanfu_2',
    outfitPalette: 'palette_gold',
    accessory: 'acc_lantern_pin',
    defaultExpression: 'gentle'
  },
  {
    id: 'preset_preset_8',
    name: 'Tuyết Lĩnh Ẩn Khách',
    hairStyle: 'hair_flowing_1',
    hairColor: '#f0f0f5',
    skinTone: '#fff3ea',
    outfitStyle: 'robe_hanfu_4',
    outfitPalette: 'palette_white',
    accessory: 'acc_jade_pendant',
    defaultExpression: 'calm'
  }
];

export const INTRO_TAGS = [
  { id: 'tag_quiet', label: 'Thích tĩnh lặng' },
  { id: 'tag_tea_lover', label: 'Mê đàm đạo trà' },
  { id: 'tag_bookworm', label: 'Yêu sách vở' },
  { id: 'tag_traveler', label: 'Thích ngao du' },
  { id: 'tag_foodie', label: 'Mê điểm tâm ngon' },
  { id: 'tag_listener', label: 'Biết lắng nghe' },
  { id: 'tag_poetic', label: 'Tâm hồn lãng mạn' },
  { id: 'tag_practical', label: 'Chân thành, thực tế' }
];
