import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Deletes all genres before seeding new ones
  await prisma.genre.deleteMany();  // Deletes all genres
  console.log("deleted all genres");

  // Array of genres to be added
  const genres = [
    "Pop", "Rock", "Hip-Hop", "R&B", "Country", "Jazz", "Classical", "Blues", 
    "Reggae", "Latin", "Electronic", "Folk", "Indie", "Soul", "Punk", "Alternative", 
    "Metal", "Dance", "K-pop", "Post-punk", "Gospel", "Funk", "Disco", "House", 
    "Techno", "Trance", "Trap", "Reggaeton", "Ambient", "Ska", "Bluegrass", 
    "World Music", "Future Bass", "Hardwave", "Wave", "Dubstep", "Lo-fi", "Chillwave", 
    "Synthwave", "Deep House", "Electropop", "Glitch Hop", "Ambient Dub", 
    "Future Funk", "Vaporwave", "Hardstyle", "Trapstep", "UK Garage", 
    "Minimal Techno", "Dark Techno", "Glitchcore", "Juke", "Tropical House", 
    "Chillstep", "Progressive Trance", "DnB (Drum and Bass)", "Breakbeat", 
    "Garage House", "Tech House", "Euro-Trance", "Cinematic Dubstep", 
    "Experimental Hip-Hop", "Chicago House", "Ghetto House", "Future Garage", 
    "Post Dubstep", "Ambient Techno", "Jazztronica", "Futuristic Soul", 
    "Noise Music", "Post-Rock", "Vocal House", "Dancehall", "Afrobeat", 
    "Electro House", "Progressive House", "Big Room", "Tech Trance", 
    "Minimal", "Psytrance", "Dark Psytrance", "Hard Trance", "Progressive Breaks", 
    "Glitch Hop", "Chillout", "Downtempo", "Ambient House", "Electronicore", 
    "Synthpop", "Industrial Techno", "Industrial Hardcore", "Euphoric Hardstyle", 
    "Liquid Drum & Bass", "Jungle", "Electro Swing"
  ];

  // Loop through each genre and insert it into the database if it doesn't already exist
  for (const genreName of genres) {
    // Check if the genre already exists
    const existingGenre = await prisma.genre.findUnique({
      where: {
        name: genreName,
      },
    });

    // Only create the genre if it doesn't already exist
    if (!existingGenre) {
      await prisma.genre.create({
        data: {
          name: genreName,
          type: "SYSTEM", // Assuming you want to set the type to "SYSTEM"
        },
      });
      console.log(`Added genre: ${genreName}`);
    } else {
      console.log(`Genre "${genreName}" already exists.`);
    }
  }

  console.log("Seed data added");
}

// Run the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
