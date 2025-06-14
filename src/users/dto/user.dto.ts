import { UUID } from "crypto";

export class UserDto {
    _id?: UUID
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    isAdmin?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    profilePicture?: string;
    description?: string;
    phoneNumber?: string;
    city?: string;
    relationshipStatus?: string;
    dateOfBirth?: Date;
    coverPicture?: string;
    following?: UUID[]; // Array of UUIDs for following users
    followers?: UUID[]; // Array of UUIDs for followers
}
