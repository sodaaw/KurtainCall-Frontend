const posters = [
    // Comedy 카테고리 (4개)
    {
      movie_id: 1,
      title: '웃음의 학교',
      category: 'comedy',
      location: '서울 종로구 대학로10길 11',
      start_date: '2025-08-10',
      end_date: '2025-08-25',
      image: '/images/event1.jpg',
      price: 20000,
      duration: 120,
      lat: 37.555,
      lng: 126.923
    },
    {
      movie_id: 2,
      title: '개그맨의 밤',
      category: 'comedy',
      location: '서울 마포구 홍대로 123',
      start_date: '2025-08-15',
      end_date: '2025-08-30',
      image: '/images/event2.jpg',
      price: 25000,
      duration: 90,
      lat: 37.556,
      lng: 126.924
    },
    {
      movie_id: 3,
      title: '즉흥 연기',
      category: 'comedy',
      location: '서울 강남구 강남대로 456',
      start_date: '2025-08-20',
      end_date: '2025-09-05',
      image: '/images/event3.jpg',
      price: 30000,
      duration: 150,
      lat: 37.557,
      lng: 126.925
    },
    {
      movie_id: 4,
      title: '코미디 클럽',
      category: 'comedy',
      location: '서울 서초구 서초대로 789',
      start_date: '2025-08-25',
      end_date: '2025-09-10',
      image: '/images/event4.jpg',
      price: 18000,
      duration: 100,
      lat: 37.558,
      lng: 126.926
    },

    // Romance 카테고리 (4개)
    {
      movie_id: 5,
      title: '로미오와 줄리엣',
      category: 'romance',
      location: '서울 중구 세종대로 123',
      start_date: '2025-08-12',
      end_date: '2025-08-27',
      image: '/images/event5.jpg',
      price: 35000,
      duration: 180,
      lat: 37.559,
      lng: 126.927
    },
    {
      movie_id: 6,
      title: '사랑의 시',
      category: 'romance',
      location: '서울 종로구 대학로 456',
      start_date: '2025-08-18',
      end_date: '2025-09-02',
      image: '/images/event1.jpg',
      price: 28000,
      duration: 140,
      lat: 37.560,
      lng: 126.928
    },
    {
      movie_id: 7,
      title: '로맨틱 발레',
      category: 'romance',
      location: '서울 강남구 테헤란로 789',
      start_date: '2025-08-22',
      end_date: '2025-09-07',
      image: '/images/event2.jpg',
      price: 40000,
      duration: 160,
      lat: 37.561,
      lng: 126.929
    },
    {
      movie_id: 8,
      title: '사랑 이야기',
      category: 'romance',
      location: '서울 마포구 와우산로 321',
      start_date: '2025-08-28',
      end_date: '2025-09-12',
      image: '/images/event3.jpg',
      price: 22000,
      duration: 110,
      lat: 37.562,
      lng: 126.930
    },

    // Horror 카테고리 (4개)
    {
      movie_id: 9,
      title: '호러 하우스',
      category: 'horror',
      location: '서울 강남구 논현로 654',
      start_date: '2025-08-14',
      end_date: '2025-08-29',
      image: '/images/event4.jpg',
      price: 32000,
      duration: 130,
      lat: 37.563,
      lng: 126.931
    },
    {
      movie_id: 10,
      title: '미스터리 씨어터',
      category: 'horror',
      location: '서울 서초구 반포대로 987',
      start_date: '2025-08-19',
      end_date: '2025-09-03',
      image: '/images/event5.jpg',
      price: 27000,
      duration: 95,
      lat: 37.564,
      lng: 126.932
    },
    {
      movie_id: 11,
      title: '어둠의 공연',
      category: 'horror',
      location: '서울 마포구 합정로 147',
      start_date: '2025-08-24',
      end_date: '2025-09-08',
      image: '/images/event1.jpg',
      price: 38000,
      duration: 170,
      lat: 37.565,
      lng: 126.933
    },
    {
      movie_id: 12,
      title: '공포 체험관',
      category: 'horror',
      location: '서울 종로구 인사동길 258',
      start_date: '2025-08-30',
      end_date: '2025-09-14',
      image: '/images/event2.jpg',
      price: 24000,
      duration: 80,
      lat: 37.566,
      lng: 126.934
    },

    // Tragedy 카테고리 (4개)
    {
      movie_id: 13,
      title: '햄릿',
      category: 'tragedy',
      location: '서울 중구 을지로 369',
      start_date: '2025-08-16',
      end_date: '2025-08-31',
      image: '/images/hamlet.jpg',
      price: 42000,
      duration: 200,
      lat: 37.567,
      lng: 126.935
    },
    {
      movie_id: 14,
      title: '오이디푸스',
      category: 'tragedy',
      location: '서울 강남구 삼성로 741',
      start_date: '2025-08-21',
      end_date: '2025-09-05',
      image: '/images/event3.jpg',
      price: 36000,
      duration: 180,
      lat: 37.568,
      lng: 126.936
    },
    {
      movie_id: 15,
      title: '안티고네',
      category: 'tragedy',
      location: '서울 서초구 서초중앙로 852',
      start_date: '2025-08-26',
      end_date: '2025-09-10',
      image: '/images/event4.jpg',
      price: 33000,
      duration: 160,
      lat: 37.569,
      lng: 126.937
    },
    {
      movie_id: 16,
      title: '리어왕',
      category: 'tragedy',
      location: '서울 마포구 상암산로 963',
      start_date: '2025-09-01',
      end_date: '2025-09-16',
      image: '/images/event5.jpg',
      price: 45000,
      duration: 220,
      lat: 37.570,
      lng: 126.938
    },

    // Thriller 카테고리 (4개)
    {
      movie_id: 17,
      title: '스릴러 나이트',
      category: 'thriller',
      location: '서울 종로구 창경궁로 159',
      start_date: '2025-08-18',
      end_date: '2025-09-02',
      image: '/images/event1.jpg',
      price: 29000,
      duration: 140,
      lat: 37.571,
      lng: 126.939
    },
    {
      movie_id: 18,
      title: '미스터리 게임',
      category: 'thriller',
      location: '서울 강남구 영동대로 357',
      start_date: '2025-08-23',
      end_date: '2025-09-07',
      image: '/images/event2.jpg',
      price: 34000,
      duration: 120,
      lat: 37.572,
      lng: 126.940
    },
    {
      movie_id: 19,
      title: '추리극',
      category: 'thriller',
      location: '서울 서초구 강남대로 468',
      start_date: '2025-08-28',
      end_date: '2025-09-12',
      image: '/images/event3.jpg',
      price: 26000,
      duration: 100,
      lat: 37.573,
      lng: 126.941
    },
    {
      movie_id: 20,
      title: '긴장의 순간',
      category: 'thriller',
      location: '서울 마포구 월드컵북로 579',
      start_date: '2025-09-02',
      end_date: '2025-09-17',
      image: '/images/event4.jpg',
      price: 31000,
      duration: 130,
      lat: 37.574,
      lng: 126.942
    },

    // Musical 카테고리 (4개)
    {
      movie_id: 21,
      title: '뮤지컬 헤드윅',
      category: 'musical',
      location: '서울 종로구 대학로 951',
      start_date: '2025-08-10',
      end_date: '2025-08-25',
      image: '/images/musical.jpg',
      price: 50000,
      duration: 180,
      lat: 37.575,
      lng: 126.943
    },
    {
      movie_id: 22,
      title: '라이온 킹',
      category: 'musical',
      location: '서울 강남구 테헤란로 753',
      start_date: '2025-08-15',
      end_date: '2025-08-30',
      image: '/images/lionking.jpg',
      price: 60000,
      duration: 200,
      lat: 37.576,
      lng: 126.944
    },
    {
      movie_id: 23,
      title: '레 미제라블',
      category: 'musical',
      location: '서울 서초구 서초대로 642',
      start_date: '2025-08-20',
      end_date: '2025-09-04',
      image: '/images/lesmis.jpg',
      price: 55000,
      duration: 190,
      lat: 37.577,
      lng: 126.945
    },
    {
      movie_id: 24,
      title: '오페라의 유령',
      category: 'musical',
      location: '서울 마포구 합정로 531',
      start_date: '2025-08-25',
      end_date: '2025-09-09',
      image: '/images/event5.jpg',
      price: 48000,
      duration: 170,
      lat: 37.578,
      lng: 126.946
    }
  ];
  
  export default posters;
  