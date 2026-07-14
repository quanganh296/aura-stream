USE vibemusic_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE listening_history;
TRUNCATE TABLE user_likes;
TRUNCATE TABLE playlist_songs;
TRUNCATE TABLE playlists;
TRUNCATE TABLE songs;
TRUNCATE TABLE artists;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Artists
INSERT INTO artists (id, name, avatar_url, bio) VALUES
(1, 'Sơn Tùng M-TP', '/assets/artists/son_tung.jpg', 'Vietnamese singer-songwriter and actor, known as King of V-Pop.'),
(2, 'Đen Vâu', '/assets/artists/den_vau.jpg', 'Vietnamese rapper and songwriter, known for his poetic lyrics and rustic lifestyle.'),
(3, 'Billie Eilish', '/assets/artists/billie_eilish.jpg', 'American singer-songwriter who first gained public attention in 2015.'),
(4, 'The Weeknd', '/assets/artists/the_weeknd.jpg', 'Canadian singer-songwriter and record producer, famous for sonic versatility.'),
(5, 'tlinh', '/assets/artists/tlinh.jpg', 'Young prominent Vietnamese female rapper and singer-songwriter.'),
(6, 'Touliver', '/assets/artists/touliver.jpg', 'Leading music producer and DJ, founder of SpaceSpeakers.'),
(7, 'Hoàng Thuỳ Linh', '/assets/artists/hoang_thuy_linh.jpg', 'Vietnamese actress and V-Pop singer known for merging traditional folk elements with modern pop.'),
(8, 'Phương Mỹ Chi', '/assets/artists/phuong_my_chi.jpg', 'Vietnamese singer famous for folk music and contemporary pop hybrids.'),
(9, 'Thành Đạt', '/assets/artists/thanh_dat.jpg', 'V-pop ballad singer known for emotional vocals and hits.'),
(10, 'Taylor Swift', '/assets/artists/taylor_swift.jpg', 'Global pop and country icon, acclaimed for her storytelling songwriting.'),
(11, 'Dua Lipa', '/assets/artists/dua_lipa.jpg', 'English singer and songwriter, known for her signature disco-pop sound.'),
(12, 'Daft Punk', '/assets/artists/daft_punk.jpg', 'Legendary French electronic music duo active from 1993 to 2021.'),
(13, 'M83', '/assets/artists/m83.jpg', 'French electronic music project formed in Antibes in 1999.'),
(14, 'Vũ.', '/assets/artists/vu.jpg', 'The Indie Pop Prince of Vietnam, known for warm acoustic ballads.');

-- 2. Insert Songs
INSERT INTO songs (id, title, artist_id, album_name, cover_url, audio_url, duration_seconds, lyrics_json) VALUES
(1, 'Ánh Đèn Đêm', 7, 'Vàng Anh', '/assets/covers/anh_den_dem.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 282, 
'[
  {"time": 0, "text": "[Nhạc dạo đầu - Instrumental]"},
  {"time": 8, "text": "Từng cơn sóng xô ngoài khơi xa"},
  {"time": 16, "text": "Mang theo bao ký ức đôi ta"},
  {"time": 24, "text": "Dưới ánh đèn đêm mờ ảo giăng lối"},
  {"time": 32, "text": "Anh đi tìm lại bóng dáng ngày xưa"},
  {"time": 40, "text": "Những lời hẹn thề giờ tựa khói mây"},
  {"time": 48, "text": "Chìm vào hư vô theo tiếng gió bay"},
  {"time": 56, "text": "Chỉ còn mình em với nỗi cô đơn..."},
  {"time": 64, "text": "Đêm lạnh giá sương rơi buốt giá bờ vai"},
  {"time": 72, "text": "Nhớ nụ cười, nhớ ánh mắt u sầu ai"},
  {"time": 80, "text": "Ngày mai nắng lên ta có còn nhau?"},
  {"time": 88, "text": "Hay chỉ là những vết cắt đau..."},
  {"time": 96, "text": "[Điệp khúc]"},
  {"time": 104, "text": "Dưới ánh đèn đêm mờ ảo giăng lối"},
  {"time": 112, "text": "Em khóc cho duyên mình lỡ làng rồi"},
  {"time": 120, "text": "Anh đi tìm lại bóng dáng ngày xưa"},
  {"time": 128, "text": "Giữa trời đông buốt giá cơn mưa"},
  {"time": 136, "text": "[Nhạc dạo giữa]"},
  {"time": 150, "text": "Chìm vào hư vô theo tiếng gió bay"},
  {"time": 158, "text": "Chỉ còn mình em với nỗi cô đơn này"},
  {"time": 166, "text": "Lòng đau thắt lại khi bóng người đi"},
  {"time": 174, "text": "Lệ rơi đẫm mi biệt ly..."},
  {"time": 182, "text": "[Guitar Solo]"},
  {"time": 210, "text": "Dưới ánh đèn đêm mờ ảo giăng lối"},
  {"time": 218, "text": "Em khóc cho duyên mình lỡ làng rồi"},
  {"time": 226, "text": "Anh đi tìm lại bóng dáng ngày xưa"},
  {"time": 234, "text": "Giữa trời đông buốt giá cơn mưa..."},
  {"time": 245, "text": "[Nhạc kết thúc - Outro]"}
]'),
(2, 'Vũ Trụ Có Anh', 8, 'Vũ Trụ Cò Bay', '/assets/covers/vu_tru_co_anh.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 222,
'[
  {"time": 0, "text": "[Intro]"},
  {"time": 5, "text": "Vũ trụ bao la rộng lớn khôn lường"},
  {"time": 10, "text": "Liệu nơi phương xa anh có vấn vương?"},
  {"time": 15, "text": "Một lòng hướng về người con gái yêu thương"},
  {"time": 20, "text": "Vượt ngàn trùng khơi tìm anh khắp muôn phương"},
  {"time": 25, "text": "[Pre-Chorus]"},
  {"time": 30, "text": "Trời đổ cơn mưa bóng anh khuất mờ"},
  {"time": 35, "text": "Để lòng em đây cứ mãi ngóng chờ"},
  {"time": 40, "text": "Vũ trụ xoay vần duyên kiếp lỡ làng"},
  {"time": 45, "text": "Tình ta nát tan!"}
]'),
(3, 'Nấu Ăn Cho Em', 2, 'Show của Đen', '/assets/covers/nau_an_cho_em.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 255,
'[
  {"time": 0, "text": "[Nhạc dạo]"},
  {"time": 10, "text": "Mặt trời vàng như quả trứng rán"},
  {"time": 15, "text": "Khi mà bóng tối đã đầu hàng"},
  {"time": 20, "text": "Đi lên trên đồi cao nhặt nhạnh từng tia nắng ấm"},
  {"time": 25, "text": "Mang niềm vui đến lớp cho các em nhỏ vùng cao..."},
  {"time": 30, "text": "Nấu một bữa cơm nóng, khói bếp bay ngang trời"},
  {"time": 35, "text": "Nhìn nụ cười rạng rỡ lòng thấy nhẹ nhàng thơi..."},
  {"time": 40, "text": "Chúng mình đi gieo hạt hy vọng nơi xa xôi"},
  {"time": 45, "text": "Mong mai này cây trái ngọt ngào nở sinh sôi."}
]'),
(4, 'Ngày Mai Người Ta Lấy Chồng', 9, 'Đơn Phương', '/assets/covers/ngay_mai_lay_chong.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 302,
'[
  {"time": 0, "text": "[Intro]"},
  {"time": 12, "text": "Ngày mai người ta lấy chồng rồi em ơi"},
  {"time": 20, "text": "Lòng anh nát tan nhìn chiếc kiệu hoa trôi"},
  {"time": 28, "text": "Duyên tình mình đành đứt đoạn từ đây"},
  {"time": 36, "text": "Để lại mình anh ôm đắng cay hao gầy..."},
  {"time": 44, "text": "Chúc em bình yên bên duyên mới ấm êm"},
  {"time": 52, "text": "Quên đi mối tình xưa đầy bóng đêm."}
]'),
(5, 'Midnight City', 13, 'Hurry Up, We\'re Dreaming', '/assets/covers/midnight_city.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 243,
'[
  {"time": 0, "text": "[Instrumental Synth Intro]"},
  {"time": 15, "text": "Waiting in a car"},
  {"time": 20, "text": "Waiting for a ride in the dark"},
  {"time": 25, "text": "The night city grows"},
  {"time": 30, "text": "Look at the horizon glow"},
  {"time": 35, "text": "Midnight city light"}
]'),
(6, 'After Hours', 4, 'After Hours', '/assets/covers/after_hours.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 361,
'[
  {"time": 0, "text": "[Intro]"},
  {"time": 10, "text": "Thought I almost died in my dream"},
  {"time": 15, "text": "Fighting for my life, I couldn\'t breathe"},
  {"time": 20, "text": "Oh baby, where are you now when I need you most?"},
  {"time": 25, "text": "I give it all just to hold you close."}
]'),
(7, 'Golden Era', 14, 'Một Vạn Năm', '/assets/covers/golden_era.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 200,
'[
  {"time": 0, "text": "[Intro Acoustic]"},
  {"time": 10, "text": "Thời gian trôi nhanh như cái chớp mắt"},
  {"time": 15, "text": "Những kỷ niệm xưa giờ đã héo úa"},
  {"time": 20, "text": "Ta đi tìm lại bóng hình xưa cũ"},
  {"time": 25, "text": "Một thời vàng son đầy tiếng cười đùa."}
]'),
(8, 'Future Nostalgia', 11, 'Future Nostalgia', '/assets/covers/future_nostalgia.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 184,
'[
  {"time": 0, "text": "[Disco Intro]"},
  {"time": 8, "text": "You want a female alpha"},
  {"time": 12, "text": "I know you\'re dying trying to figure me out"},
  {"time": 16, "text": "My Future Nostalgia is here"}
]'),
(9, 'Folklore', 10, 'Folklore', '/assets/covers/folklore.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 239,
'[
  {"time": 0, "text": "[Piano Intro]"},
  {"time": 12, "text": "Green was the color of the grass"},
  {"time": 18, "text": "Where I used to read at Centennial Park"},
  {"time": 24, "text": "Time, mystical time, cutting me open then healing me fine"}
]'),
(10, 'Discovery', 12, 'Discovery', '/assets/covers/discovery.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 305,
'[
  {"time": 0, "text": "[Synth Electro Beat]"},
  {"time": 15, "text": "One more time, we\'re gonna celebrate"},
  {"time": 22, "text": "Oh yeah, alright, don\'t stop the dancing"},
  {"time": 29, "text": "One more time, music\'s got me feeling so free"}
]');
