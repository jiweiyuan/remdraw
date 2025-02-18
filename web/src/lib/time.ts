export function timeSince(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now.getTime() - past.getTime();

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return `${diffInDays} days ago`;
    }
}

// Function to pad single digit numbers with a leading zero
function pad(number: number): string {
    return number < 10 ? '0' + number : number.toString();
}

// Function to format a Date object as YYYY-MM-DD-HHmm
export function formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}-${hours}${minutes}`;
}

export function formatTimeDifference(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffInSeconds = Math.abs((endDate.getTime() - startDate.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / (3600 * 24));

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
        return `${Math.floor(diffInSeconds)} second${diffInSeconds > 1 ? 's' : ''}`;
    }
}


