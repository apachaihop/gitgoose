'use client';

import Button from "@mui/material/Button";
import GitGooseLogo from "./gitgoose-logo";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className="bg-white">
            <div className="flex justify-between items-center h-16 border-b border-gray-300">
                <div className="flex items-center gap-2 w-full pl-5">
                    <GitGooseLogo/>
                    <div className="flex gap-7 w-full pl-10">
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/repositories">Repositories</Link>
                        <Link href="/pull-requests">Pull Requests</Link>
                    </div>
                    <div className="flex items-center gap-8 pr-10">
                        {user ? (
                            <>
                                <Avatar
                                    onClick={handleMenu}
                                    className="cursor-pointer"
                                >
                                    {user.name?.[0]}
                                </Avatar>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleClose}>Settings</MenuItem>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Link href="/signin">
                                    <Button className="text-nowrap" size="small" variant="text">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="text-nowrap" size="small" variant="text">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}