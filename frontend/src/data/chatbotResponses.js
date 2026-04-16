const chatbotResponses = {
  // --- Polite Interactions ---
  "thank you": [
    "You're welcome! If you have more questions, feel free to ask.",
    "No problem! Happy to help.",
    "Anytime! Is there anything else I can assist you with?",
    "My pleasure! Let me know if you need anything else."
  ],
  "bye": [
    "Goodbye! Have a great day.",
    "Farewell! Feel free to come back and chat anytime.",
    "See you later! Take care."
  ],

  // --- Greetings ---
  "hello": ["Hello! How can I assist you today?", "Hi there! What's on your mind?", "Hey! I'm here to help. What's up?"],
  "hi": ["Hi there! What can I do for you?", "Hello! How may I help you?", "Hey there! Good to see you."],
  "hey": ["Hey! How can I help you today?", "Hello! What can I do for you?", "Hi! How's it going?"],
  "good morning": "Good morning! I hope you have a productive day. How can I assist you?",
  "howdy": "Howdy partner! What can I do for you today?",
  "good afternoon": "Good afternoon! What can I help you with?",
  "good evening": "Good evening! How may I assist you?",
  "good night": "Good night! Sleep well!",
  
  // --- About the Bot ---
  "how are you?": [
    "I'm just a bot, but I'm functioning perfectly!", 
    "I'm doing great, thanks for asking! How can I help you?",
    "I'm an AI, so I don't have feelings, but I'm online and ready to assist!"
  ],
  "what is your name?": ["I am Nexus AI, your virtual assistant.", "You can call me Nexus AI.", "My name is Nexus AI, at your service."],
  "who are you?": ["I'm an AI chatbot designed to provide information and assist you with your questions.", "I'm Nexus AI, a virtual assistant ready to chat.", "I am an AI language model created to be helpful and informative."],
  "what can you do?": [
    "I can answer your questions, provide information on a wide range of topics, tell you jokes, and even help with some technical concepts. What do you need?",
    "I can help you with general knowledge, coding questions, brainstorming ideas, or just a friendly chat. Ask me anything!"
  ],
  "what are your features?": "I can process and understand natural language, provide instant answers from my knowledge base, and adapt to our conversation. I'm always learning new things!",
  "are you human?": "No, I'm an AI chatbot created to assist you.",
  "are you a robot?": "Yes, I'm a chatbot powered by artificial intelligence.",
  "who created you?": "I was created by a talented developer as a project to explore the capabilities of AI.",
  "what is your purpose?": "My purpose is to make information more accessible and to assist you in any way I can.",
  
  // --- Help & Support ---
  "help": ["Sure, I am here to help. What do you need assistance with?", "Of course, how can I help you?", "I'm here to assist. What's the issue?"],
  "i need help": "Of course! Tell me what you need help with and I'll do my best to assist you.",
  "i have a problem": "I'm here to help. Please describe the problem you're facing.",
  "can you help me?": "Absolutely! What do you need help with?",
  "support": "I'm here to provide support. What issue are you facing?",
  "how do i contact support?": "For technical issues with the application, you should contact the development team. For general questions, I'm your first line of support!",

  // --- Logical & Knowledge-based Questions ---
  "what is logic?": "Logic is the study of reasoning and argumentation. It helps in distinguishing good reasoning from bad reasoning.",
  "if a is b and b is c, what is a?": "If A is B, and B is C, then A is C. This is an example of the transitive property.",
  "what is the capital of france?": "The capital of France is Paris.",
  "who wrote 'hamlet'?": "William Shakespeare wrote 'Hamlet'.",
  "what is the meaning of life?": "That's a deep question! Philosophers have debated it for centuries. Many believe it's about finding happiness, purpose, and connection with others. What does it mean to you?",
  "what is the formula for water?": "The chemical formula for water is H2O.",
  "what is photosynthesis?": "Photosynthesis is the process plants use to convert light energy into chemical energy. They take in carbon dioxide and water, and with sunlight, create glucose (their food) and release oxygen.",
  "how does a car engine work?": "A car engine works by burning fuel and air to create motion. This process, called internal combustion, pushes pistons up and down, which turns a crankshaft and ultimately powers the wheels.",
  "who is the president of the united states?": "As of my last update, the President of the United States is Joe Biden. For the most current information, please check a reliable news source.",

  // --- Technical & Coding Questions ---
  "what is an api?": "API stands for Application Programming Interface. It's a set of rules and tools that allows different software applications to communicate with each other.",
  "what is javascript?": "JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS.",
  "what is react?": "React is a free and open-source front-end JavaScript library for building user interfaces based on UI components. It is maintained by Meta and a community of individual developers and companies.",
  "what is html?": "HTML stands for HyperText Markup Language. It's the standard markup language for documents designed to be displayed in a web browser.",
  "what is css?": "CSS stands for Cascading Style Sheets. It's a style sheet language used for describing the presentation of a document written in a markup language like HTML.",
  "what is a database?": "A database is an organized collection of structured information, or data, typically stored electronically in a computer system.",
  "what is the difference between sql and nosql?": "SQL databases are relational, use structured query language, and have a predefined schema (like tables in Excel). NoSQL databases are non-relational, have dynamic schemas for unstructured data, and are more flexible (like a folder of JSON files).",
  "what is cloud computing?": "Cloud computing is the on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.",
  "what is an algorithm?": "An algorithm is a set of step-by-step instructions or rules to be followed to solve a problem or perform a task, especially by a computer.",
  "what are data structures?": "Data structures are a way of organizing, managing, and storing data in a computer so that it can be accessed and modified efficiently. Examples include arrays, linked lists, and trees.",
  "what is machine learning?": "Machine learning is a branch of artificial intelligence (AI) that focuses on building systems that learn from data, identify patterns, and make decisions with minimal human intervention.",
  "what is git?": "Git is a distributed version control system used to track changes in source code during software development. It allows multiple developers to collaborate on projects.",
  "what is python?": "Python is a popular, high-level programming language known for its simple, readable syntax. It's widely used in web development, data science, artificial intelligence, and automation.",
  "what is node.js?": "Node.js is a runtime environment that allows you to run JavaScript on the server-side. It's great for building fast and scalable network applications.",
  "what is docker?": "Docker is a platform that uses containers to create, deploy, and run applications. A container packages up code and all its dependencies, so the application runs quickly and reliably from one computing environment to another.",

  // --- Computer Science Concepts ---
  "what is object-oriented programming?": "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data (attributes) and code (methods). Key principles are encapsulation, inheritance, and polymorphism.",
  "what is recursion?": "Recursion is a programming technique where a function calls itself to solve a problem. It's like a set of Russian nesting dolls, where each doll contains a smaller version of itself until you reach the smallest one.",
  "what is big o notation?": "Big O notation is used in computer science to describe the performance or complexity of an algorithm. It tells you how the runtime or space requirements of an algorithm grow as the input size grows.",
  "what is the difference between an array and a linked list?": "An array stores elements in a contiguous block of memory, making it fast to access any element by its index. A linked list stores elements as separate objects (nodes) that point to the next one, making it easier to add or remove elements in the middle.",
  "what is a hash table?": "A hash table is a data structure that stores key-value pairs. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found. This allows for very fast lookups, insertions, and deletions.",
  "what is the difference between tcp and udp?": "TCP (Transmission Control Protocol) is connection-oriented, reliable, and ensures all data arrives in order. It's like sending a registered letter. UDP (User Datagram Protocol) is connectionless and faster but doesn't guarantee delivery or order. It's like sending a postcard.",
  "what is an operating system?": "An operating system (OS) is the software that manages all of the hardware and software resources on a computer. It's the intermediary between you and the computer hardware. Examples include Windows, macOS, and Linux.",

  // --- Emotional Responses ---
  "i feel sad": [
    "I'm sorry to hear that you're feeling sad. Sometimes talking about it can help. Remember that it's okay to feel this way, and things can get better.",
    "I'm here to listen if you want to talk. It's important to acknowledge your feelings.",
    "I'm sorry you're going through a tough time. Remember to be kind to yourself. Your feelings are valid."
  ],
  "i am happy": "That's wonderful to hear! I'm glad you're feeling happy. What's making you smile?",
  "i'm excited!": "That's great! What are you excited about? I'd love to hear all about it.",
  "i feel anxious": "It's understandable to feel anxious sometimes. Try taking a few deep breaths. Focusing on your breath can help calm your mind.",
  "i'm feeling stressed": "Stress can be tough to deal with. Have you considered taking a short break or doing something you enjoy to relax? Even a few minutes can make a difference.",
  "i'm feeling overwhelmed": "It's okay to feel overwhelmed. Try to break things down into smaller, manageable tasks. You don't have to do everything at once. You've got this.",
  "i'm feeling lonely": "I'm sorry you're feeling lonely. Know that you're not alone in feeling this way. I'm here to chat if you need a friend.",
  "i'm having a bad day": "I'm sorry to hear that. Remember that bad days don't last forever. Is there anything I can do to help make it a little better?",
  "i'm having a great day": "That's awesome! I love to hear it. I hope the rest of your day is just as fantastic.",
  "can you give me some encouragement?": "Of course! You are capable of amazing things. Every step you take, no matter how small, is progress. Keep going, and believe in yourself!",

  // --- General Conversation & Fun ---
  "what is the weather like?": "I can't check the real-time weather.",
  "what time is it?": "I don't have a clock, but your device should show you the current time!",
  "can you write a poem?": "Roses are red, violets are blue, I'm a chatbot here, to help and chat with you!",
  "what's your favorite color?": "As an AI, I don't see colors, but I think the color of a clear blue sky is quite beautiful in pictures!",
  "do you have hobbies?": "You could say my hobby is learning new things and chatting with people like you!",
  "what are you doing?": ["Just processing some data and waiting for your next question!", "Chatting with you, of course!", "Thinking in binary. How can I help?"],
  "tell me something interesting": "The Eiffel Tower can be 15 cm taller during the summer, due to thermal expansion meaning the iron heats up, the particles gain kinetic energy and take up more space.",

  // --- Jokes ---
  "tell me a joke": [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fake noodle? An Impasta!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!"
  ],
  "tell me a programming joke": [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "There are 10 types of people in the world: those who understand binary, and those who don't.",
    "A programmer puts two glasses on his bedside table before going to sleep. A full one, in case he gets thirsty, and an empty one, in case he doesn't."
  ],
  "tell me a dad joke": [
    "I'm afraid for the calendar. Its days are numbered.",
    "What do you call a fish with no eyes? Fsh.",
    "I don't trust stairs. They're always up to something."
  ],
  "make me laugh": "I asked my dog what's two minus two. He said nothing.",

  // --- Fun Facts ---
  "tell me a fun fact": [
    "Did you know that a group of flamingos is called a 'flamboyance'? Nature has a sense of style!",
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    "A single cloud can weigh more than a million pounds."
  ],
  "tell me a science fact": "The human brain takes in 11 million bits of information every second but is aware of only 40.",
  "tell me a history fact": "In ancient Rome, it was considered a sign of leadership to have a crooked nose.",
  "tell me an animal fact": "Octopuses have three hearts. Two pump blood through the gills, and the third pumps it to the rest of the body.",
  "tell me something i don't know": "The national animal of Scotland is the unicorn. Seriously."
};

export default chatbotResponses;
