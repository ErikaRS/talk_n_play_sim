/**
 * Story data for the Sesame Street Talk 'n Play simulator
 * Based on "A Day at the Park" theme
 */
const storyData = {
    // Story metadata
    title: "A Day at the Park",
    totalPages: 3,
    defaultTimeoutSeconds: 10,
    
    // Character information
    characters: {
        "Big Bird": {
            color: "yellow",
            sound: "squawk",
            tone: "cheerful and optimistic"
        },
        "Elmo": {
            color: "red",
            sound: "giggle",
            tone: "excited and curious"
        },
        "Cookie Monster": {
            color: "blue",
            sound: "nom nom",
            tone: "food-focused and enthusiastic"
        },
        "Oscar": {
            color: "green",
            sound: "grumble",
            tone: "grumpy but secretly enjoying"
        }
    },
    
    // Page data
    pages: [
        // Page 1: Park entrance
        {
            id: 1,
            image: "page1.svg",
            description: "Park entrance with a gate, trees, and a path leading into the park",
            narratorIntro: "Welcome to a sunny day at Sesame Park! Who would you like to follow on this adventure?",
            isChoicePoint: true,
            tracks: {
                "Big Bird": {
                    text: "Big Bird flapped his wings with excitement as he approached the park entrance. \"Oh boy! I can't wait to play on the swings and slides with all my friends!\" he chirped happily. The tall yellow bird spotted the playground in the distance and couldn't wait to get there.",
                    narratorFollowUp: "Let's follow Big Bird to the playground! Who do you want to see next?"
                },
                "Elmo": {
                    text: "\"Elmo loves the park!\" the little red monster exclaimed, bouncing up and down. Elmo was especially excited because he brought his favorite picnic blanket and was looking forward to having lunch with his friends in the sunshine.",
                    narratorFollowUp: "Let's join Elmo on his way to the picnic area! Who do you want to see next?"
                },
                "Cookie Monster": {
                    text: "Cookie Monster sniffed the air as he entered the park. \"Me smell something delicious!\" he declared, rubbing his tummy. \"Maybe friends bring cookies and treats for picnic? Me hope so!\" He started heading toward where he thought the food might be.",
                    narratorFollowUp: "Let's follow Cookie Monster as he searches for snacks! Who do you want to see next?"
                },
                "Oscar": {
                    text: "\"Hmph! Parks are too sunny, too grassy, and too...fun,\" Oscar grumbled from inside his trash can, which he had brought with him. But secretly, even Oscar was looking forward to spending time with his friends, though he'd never admit it.",
                    narratorFollowUp: "Let's see what Oscar really thinks about the park! Who do you want to see next?"
                }
            }
        },
        
        // Page 2: Playground equipment
        {
            id: 2,
            image: "page2.svg",
            description: "Playground with swings, slides, and other equipment",
            narratorIntro: "Everyone has arrived at the playground! Which character would you like to follow now?",
            isChoicePoint: true,
            tracks: {
                "Big Bird": {
                    text: "Big Bird headed straight for the swings, but realized he was a bit too big for them. \"That's okay,\" he said cheerfully. \"I can still have fun watching my friends and helping push them on the swings!\" He looked around, wondering where everyone would like to go next.",
                    narratorFollowUp: "Big Bird is being such a good friend! Where should we go now?"
                },
                "Elmo": {
                    text: "\"Wheee!\" Elmo shouted as he went down the slide three times in a row. \"Sliding is so much fun!\" After playing on the slide, Elmo was starting to get hungry. \"Maybe it's time for our picnic?\" he wondered aloud.",
                    narratorFollowUp: "Elmo had so much fun on the slide! Where should we go now?"
                },
                "Cookie Monster": {
                    text: "Cookie Monster tried the seesaw, but he was too distracted by the thought of snacks. \"Playground fun, but lunch more fun!\" he declared. \"Anyone ready for picnic yet?\" He looked hopefully toward the picnic area, wondering if there might be cookies waiting.",
                    narratorFollowUp: "Cookie Monster is getting hungry! Where should we go next?"
                },
                "Oscar": {
                    text: "Oscar peeked out of his trash can near the sandbox. \"Sand is almost as good as dirt,\" he admitted. \"And at least it gets in everyone's shoes and makes them grouchy.\" He smiled slightly, then quickly frowned again when he noticed someone looking. \"What? I'm not having fun!\"",
                    narratorFollowUp: "Is Oscar secretly enjoying himself? Where should we go next?"
                }
            }
        },
        
        // Page 3: Picnic area
        {
            id: 3,
            image: "page3.svg",
            description: "Picnic area with tables, blankets, and food",
            narratorIntro: "Everyone has gathered at the picnic area for lunch! Who would you like to see now?",
            isChoicePoint: true,
            tracks: {
                "Big Bird": {
                    text: "Big Bird helped spread out the picnic blanket and made sure everyone had a place to sit. \"Sharing a meal with friends is one of my favorite things,\" he said, passing out sandwiches. \"What a perfect day at the park!\"",
                    narratorFollowUp: "Big Bird loves spending time with his friends! What a wonderful day at the park."
                },
                "Elmo": {
                    text: "\"Elmo brought apple slices to share!\" the little red monster announced proudly, placing them in the center of the blanket. \"Elmo thinks picnics with friends make the best days ever!\" He giggled happily as he enjoyed his lunch in the sunshine.",
                    narratorFollowUp: "Elmo is having such a wonderful time with his friends! What a great day at the park."
                },
                "Cookie Monster": {
                    text: "\"COOKIES!\" Cookie Monster shouted with joy when he saw the desserts. He tried to be polite and wait his turn, but it was hard. \"Me love picnic! Best part of day at park!\" he declared, munching happily. \"Friends and cookies make perfect day!\"",
                    narratorFollowUp: "Cookie Monster found his cookies at last! What a fun day at the park."
                },
                "Oscar": {
                    text: "\"I brought sardine and pickle sandwiches,\" Oscar announced, pulling slightly squished sandwiches from his trash can. To his surprise, his friends each took one to be polite. \"Hmm, this picnic isn't terrible, I guess,\" he admitted with the tiniest smile.",
                    narratorFollowUp: "Even Oscar had a good time today! What a special day at the park."
                }
            }
        }
    ]
};