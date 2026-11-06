import { usersServer } from "./users-server";

usersServer.listen(3000, () => {
    console.log("Users server running at http://localhost:3000/");
});
