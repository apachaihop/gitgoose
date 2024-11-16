import { CircularProgress } from '@mui/material';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <CircularProgress />
        </div>
    );
}