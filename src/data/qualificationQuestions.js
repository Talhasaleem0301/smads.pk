// ── Qualification Test Question Bank ────────────────────────────────────
// 100 general-knowledge multiple-choice questions used by the admin
// "Test Submission" panel (Question Bank view) and by the worker-facing
// "Attempt Test" flow on the Profile page, which randomly draws 10 of
// these 100 questions for each attempt.
//
// Shape: { id, question, options: [4 strings], correctIndex: 0-3 }

export const qualificationQuestions = [
  { id: 1, question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctIndex: 2 },
  { id: 2, question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctIndex: 1 },
  { id: 3, question: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { id: 4, question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3 },
  { id: 5, question: 'Who wrote the play "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Leo Tolstoy'], correctIndex: 1 },
  { id: 6, question: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'O2', 'NaCl'], correctIndex: 0 },
  { id: 7, question: 'Which country is home to the kangaroo?', options: ['South Africa', 'Brazil', 'Australia', 'India'], correctIndex: 2 },
  { id: 8, question: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], correctIndex: 2 },
  { id: 9, question: 'Which gas do plants primarily absorb for photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 2 },
  { id: 10, question: 'What is the capital city of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correctIndex: 2 },
  { id: 11, question: 'How many days are there in a leap year?', options: ['364', '365', '366', '367'], correctIndex: 2 },
  { id: 12, question: 'What is the largest mammal in the world?', options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correctIndex: 1 },
  { id: 13, question: 'Which organ in the human body pumps blood?', options: ['Lungs', 'Liver', 'Heart', 'Kidney'], correctIndex: 2 },
  { id: 14, question: 'What is the freezing point of water in Celsius?', options: ['0°C', '32°C', '100°C', '-10°C'], correctIndex: 0 },
  { id: 15, question: 'Which country has the largest population in the world?', options: ['USA', 'India', 'China', 'Indonesia'], correctIndex: 2 },
  { id: 16, question: 'What does "www" stand for in a website address?', options: ['World Wide Web', 'World Wide Wire', 'Web World Wide', 'Wide World Web'], correctIndex: 0 },
  { id: 17, question: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correctIndex: 1 },
  { id: 18, question: 'What is the currency of Japan?', options: ['Won', 'Yuan', 'Yen', 'Ringgit'], correctIndex: 2 },
  { id: 19, question: 'How many players are there in a football (soccer) team on the field?', options: ['9', '10', '11', '12'], correctIndex: 2 },
  { id: 20, question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Cytoplasm'], correctIndex: 2 },
  { id: 21, question: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correctIndex: 2 },
  { id: 22, question: 'What is the national language of Pakistan?', options: ['Punjabi', 'Urdu', 'Sindhi', 'Pashto'], correctIndex: 1 },
  { id: 23, question: 'Which shape has three sides?', options: ['Square', 'Triangle', 'Pentagon', 'Hexagon'], correctIndex: 1 },
  { id: 24, question: 'What is the boiling point of water in Celsius?', options: ['90°C', '100°C', '110°C', '120°C'], correctIndex: 1 },
  { id: 25, question: 'Which is the tallest mountain in the world?', options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Nanga Parbat'], correctIndex: 2 },
  { id: 26, question: 'What is the main language spoken in Brazil?', options: ['Spanish', 'Portuguese', 'French', 'Italian'], correctIndex: 1 },
  { id: 27, question: 'Which instrument is used to measure temperature?', options: ['Barometer', 'Thermometer', 'Hygrometer', 'Speedometer'], correctIndex: 1 },
  { id: 28, question: 'How many colors are there in a rainbow?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { id: 29, question: 'Which is the largest desert in the world?', options: ['Sahara', 'Gobi', 'Antarctic', 'Kalahari'], correctIndex: 2 },
  { id: 30, question: 'What is the square root of 64?', options: ['6', '7', '8', '9'], correctIndex: 2 },
  { id: 31, question: 'Which company developed the Windows operating system?', options: ['Apple', 'Google', 'Microsoft', 'IBM'], correctIndex: 2 },
  { id: 32, question: 'What is the capital of the United States?', options: ['New York', 'Washington, D.C.', 'Los Angeles', 'Chicago'], correctIndex: 1 },
  { id: 33, question: 'Which vitamin is produced when skin is exposed to sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], correctIndex: 3 },
  { id: 34, question: 'What is the term for a word that means the same as another word?', options: ['Antonym', 'Synonym', 'Homonym', 'Acronym'], correctIndex: 1 },
  { id: 35, question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correctIndex: 1 },
  { id: 36, question: 'Which is the smallest planet in our solar system?', options: ['Mars', 'Mercury', 'Venus', 'Pluto'], correctIndex: 1 },
  { id: 37, question: 'What gas do humans exhale that plants use?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'], correctIndex: 2 },
  { id: 38, question: 'Which ocean lies between Africa and Australia?', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], correctIndex: 2 },
  { id: 39, question: 'What is the process by which plants make their food called?', options: ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'], correctIndex: 1 },
  { id: 40, question: 'Which metal is liquid at room temperature?', options: ['Iron', 'Mercury', 'Aluminum', 'Copper'], correctIndex: 1 },
  { id: 41, question: 'What is 15% of 200?', options: ['20', '25', '30', '35'], correctIndex: 2 },
  { id: 42, question: 'Which country gifted the Statue of Liberty to the USA?', options: ['England', 'Spain', 'France', 'Italy'], correctIndex: 2 },
  { id: 43, question: 'What is the study of living organisms called?', options: ['Physics', 'Chemistry', 'Biology', 'Geology'], correctIndex: 2 },
  { id: 44, question: 'Which of these is a search engine?', options: ['Google', 'Photoshop', 'Excel', 'Windows'], correctIndex: 0 },
  { id: 45, question: 'How many bones are there in an adult human body?', options: ['186', '206', '226', '246'], correctIndex: 1 },
  { id: 46, question: 'What is the largest country in the world by area?', options: ['Canada', 'USA', 'China', 'Russia'], correctIndex: 3 },
  { id: 47, question: 'Which programming language is primarily used for styling web pages?', options: ['HTML', 'CSS', 'Python', 'Java'], correctIndex: 1 },
  { id: 48, question: 'What is the closest star to Earth?', options: ['Proxima Centauri', 'The Sun', 'Sirius', 'Betelgeuse'], correctIndex: 1 },
  { id: 49, question: 'Which animal is known as the "Ship of the Desert"?', options: ['Horse', 'Camel', 'Donkey', 'Goat'], correctIndex: 1 },
  { id: 50, question: 'What is the value of Pi (π) rounded to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctIndex: 1 },
  { id: 51, question: 'Which is the fastest land animal?', options: ['Lion', 'Cheetah', 'Horse', 'Leopard'], correctIndex: 1 },
  { id: 52, question: 'What is the primary function of red blood cells?', options: ['Fight infection', 'Carry oxygen', 'Clot blood', 'Digest food'], correctIndex: 1 },
  { id: 53, question: 'Which file extension is used for a Microsoft Excel spreadsheet?', options: ['.docx', '.pptx', '.xlsx', '.pdf'], correctIndex: 2 },
  { id: 54, question: 'What is the capital of the United Kingdom?', options: ['Manchester', 'Liverpool', 'London', 'Birmingham'], correctIndex: 2 },
  { id: 55, question: 'Which sense organ is used for hearing?', options: ['Eye', 'Ear', 'Nose', 'Skin'], correctIndex: 1 },
  { id: 56, question: 'What is 12 multiplied by 12?', options: ['124', '134', '144', '154'], correctIndex: 2 },
  { id: 57, question: 'Which continent is the Sahara Desert located in?', options: ['Asia', 'Africa', 'Australia', 'South America'], correctIndex: 1 },
  { id: 58, question: 'What is the term for a shape with four equal sides?', options: ['Rectangle', 'Square', 'Rhombus', 'Trapezoid'], correctIndex: 1 },
  { id: 59, question: 'Which is the main gas found in the air we breathe?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 1 },
  { id: 60, question: 'What is the term used for money paid to an employee for work done?', options: ['Salary', 'Tax', 'Loan', 'Interest'], correctIndex: 0 },
  { id: 61, question: 'Which planet has rings around it that are easily visible?', options: ['Earth', 'Mars', 'Saturn', 'Mercury'], correctIndex: 2 },
  { id: 62, question: 'What is the past tense of the verb "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], correctIndex: 1 },
  { id: 63, question: 'Which of these is a mammal?', options: ['Shark', 'Frog', 'Dolphin', 'Crocodile'], correctIndex: 2 },
  { id: 64, question: 'What is the capital of Germany?', options: ['Munich', 'Berlin', 'Hamburg', 'Frankfurt'], correctIndex: 1 },
  { id: 65, question: 'How many minutes are there in a full day?', options: ['1200', '1440', '1600', '1800'], correctIndex: 1 },
  { id: 66, question: 'Which of the following is an input device for a computer?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], correctIndex: 2 },
  { id: 67, question: 'What is the term for a baby dog called?', options: ['Kitten', 'Puppy', 'Cub', 'Calf'], correctIndex: 1 },
  { id: 68, question: 'Which is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'], correctIndex: 2 },
  { id: 69, question: 'What is the unit used to measure electric current?', options: ['Volt', 'Watt', 'Ampere', 'Ohm'], correctIndex: 2 },
  { id: 70, question: 'Which of these fruits is known to be rich in Vitamin C?', options: ['Banana', 'Orange', 'Potato', 'Rice'], correctIndex: 1 },
  { id: 71, question: 'What does "CPU" stand for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Processing Unit', 'Central Program Utility'], correctIndex: 1 },
  { id: 72, question: 'Which is the largest bird in the world by size?', options: ['Eagle', 'Ostrich', 'Peacock', 'Penguin'], correctIndex: 1 },
  { id: 73, question: 'What is 9 squared?', options: ['72', '81', '90', '99'], correctIndex: 1 },
  { id: 74, question: 'Which sea is bordered by Egypt, Israel, and Saudi Arabia?', options: ['Black Sea', 'Red Sea', 'Caspian Sea', 'Dead Sea'], correctIndex: 1 },
  { id: 75, question: 'What is a group of stars forming a recognizable pattern called?', options: ['Galaxy', 'Constellation', 'Nebula', 'Orbit'], correctIndex: 1 },
  { id: 76, question: 'Which is the official currency of the United States?', options: ['Pound', 'Euro', 'Dollar', 'Peso'], correctIndex: 2 },
  { id: 77, question: 'What is the study of weather and climate called?', options: ['Geology', 'Meteorology', 'Astronomy', 'Ecology'], correctIndex: 1 },
  { id: 78, question: 'Which part of the plant conducts photosynthesis?', options: ['Root', 'Stem', 'Leaf', 'Flower'], correctIndex: 2 },
  { id: 79, question: 'What is the term for the number of times a wave repeats per second?', options: ['Amplitude', 'Frequency', 'Wavelength', 'Velocity'], correctIndex: 1 },
  { id: 80, question: 'Which is the smallest country in the world by area?', options: ['Monaco', 'Vatican City', 'San Marino', 'Malta'], correctIndex: 1 },
  { id: 81, question: 'What is the main ingredient used to make bread?', options: ['Rice', 'Flour', 'Sugar', 'Salt'], correctIndex: 1 },
  { id: 82, question: 'Which of these is an example of a renewable energy source?', options: ['Coal', 'Natural Gas', 'Solar Power', 'Petroleum'], correctIndex: 2 },
  { id: 83, question: 'What is the term for the leader of a country that is a monarchy?', options: ['President', 'Prime Minister', 'King/Queen', 'Governor'], correctIndex: 2 },
  { id: 84, question: 'Which language is primarily used for structuring content on the web?', options: ['CSS', 'HTML', 'SQL', 'JSON'], correctIndex: 1 },
  { id: 85, question: 'What is the term for an animal that eats both plants and meat?', options: ['Herbivore', 'Carnivore', 'Omnivore', 'Insectivore'], correctIndex: 2 },
  { id: 86, question: 'Which of these numbers is a prime number?', options: ['9', '15', '17', '21'], correctIndex: 2 },
  { id: 87, question: 'What is the capital of Canada?', options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correctIndex: 2 },
  { id: 88, question: 'Which organ filters waste from the blood in the human body?', options: ['Liver', 'Kidney', 'Heart', 'Lungs'], correctIndex: 1 },
  { id: 89, question: 'What is the term for a document that lists a person’s work experience and skills?', options: ['Invoice', 'Resume/CV', 'Contract', 'Memo'], correctIndex: 1 },
  { id: 90, question: 'Which of these is used to send and receive email?', options: ['Browser', 'Email Client', 'Spreadsheet', 'Compiler'], correctIndex: 1 },
  { id: 91, question: 'What is 100 divided by 4?', options: ['20', '25', '30', '35'], correctIndex: 1 },
  { id: 92, question: 'Which planet is known for having the Great Red Spot?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'], correctIndex: 1 },
  { id: 93, question: 'What is the term used for the buying and selling of goods online?', options: ['E-commerce', 'E-mail', 'E-learning', 'E-banking'], correctIndex: 0 },
  { id: 94, question: 'Which is the longest bone in the human body?', options: ['Humerus', 'Femur', 'Tibia', 'Radius'], correctIndex: 1 },
  { id: 95, question: 'What is the term for a period of ten years?', options: ['Century', 'Decade', 'Millennium', 'Era'], correctIndex: 1 },
  { id: 96, question: 'Which of these is a popular spreadsheet software?', options: ['Word', 'PowerPoint', 'Excel', 'Access'], correctIndex: 2 },
  { id: 97, question: 'What is the chemical symbol for gold?', options: ['Ag', 'Au', 'Gd', 'Go'], correctIndex: 1 },
  { id: 98, question: 'Which continent has the most countries?', options: ['Asia', 'Europe', 'Africa', 'South America'], correctIndex: 2 },
  { id: 99, question: 'What is the term for money you owe to someone?', options: ['Asset', 'Debt', 'Profit', 'Revenue'], correctIndex: 1 },
  { id: 100, question: 'Which of these best describes a "deadline" in work?', options: ['A type of payment', 'The final time to submit work', 'A job title', 'A software tool'], correctIndex: 1 },
]

// Fisher–Yates shuffle, returns a new shuffled array without mutating input.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Randomly draws `count` unique questions from the full bank (default 10),
// used by the worker's Attempt Test flow.
export function drawRandomQuestions(count = 10) {
  return shuffle(qualificationQuestions).slice(0, count)
}
