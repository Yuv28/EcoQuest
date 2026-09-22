### EcoQuest
EcoQuest is both a gamified approach to improving wildlife data for researchers and a social interaction platform to get people out into the natural world. Users input answers to a series of questions when making their account to create their persona. Then, they will be recommended various people to add to their friends list and go on quests with.

### The Quests:
Quests are a group of tasks that users complete in order to earn points and rewards. Typically, a quest involves finding a certain species in the wild, interacting with it, and taking a photo and submitting it to iNaturalist -- a platform used by professors and wildlife researchers. 

Quests can be either solo or in a group. Users can choose to be matched with new people based on persona recommendations, or they can go with a predefined group of friends. No matter what they choose, they are guaranteed to have fun going on nature-based adventures!

### Tech Stack:
- AWS (S3, DynamoDB, Lambda, Sagemaker, API Gateway)
- React.js
- JupyterNotebook and Pandas
<img width="892" height="490" alt="Screenshot 2026-09-22 at 5 25 38 PM" src="https://github.com/user-attachments/assets/a47fec25-1bc1-417d-b644-a0da41b17d1a" />

### How it Works:
- After users answer a series of persona-building questions, the information is stored in a DynamoDB table. Lambda triggers send that data to a persona-matching model on Sagemaker which generates similarity scores based on proximity, personality traits, and interests.
<img width="1361" height="633" alt="Screenshot 2026-09-22 at 5 41 26 PM" src="https://github.com/user-attachments/assets/83f2171b-cc9b-499e-8010-f86fab3dd985" />

- An S3 bucket contains images of animals from iNaturalist data. JupyterNotebooks are used to train models and Pandas is used to create dataframes that are uploaded to DynamoDB with information about the animals. Another Lambda function is triggered which sends data to an image classification model on Sagemaker to identify what the animal is and specific facts about it.
<img width="1365" height="437" alt="Screenshot 2026-09-22 at 5 41 40 PM" src="https://github.com/user-attachments/assets/d08ac8f1-598a-44ab-af24-74abece5aeba" />

- The application is a progressive web app with direct camera and photos integration for both iOS and Android. Users can either take pictures of animals using EcoQuest's built in camera feature or upload a photo from their personal images and the model will identify what animal it is
<img width="1355" height="686" alt="Screenshot 2026-09-22 at 5 42 41 PM" src="https://github.com/user-attachments/assets/3ca739fa-9774-4305-8bd0-c2706e27bcdb" />

- After completing a quest, users can level up and earn points

### Future Work:
- Further improvements to the ML and image classification models
- Integration with Meta Glasses
- Direct API integration with iNaturalist

### Try it Out:
Meet your Eco-Tribe: https://eco-quest-five.vercel.app?_vercel_share=bey0FDeH2M3mDcxLWsQExiS1YMHjgnb0
