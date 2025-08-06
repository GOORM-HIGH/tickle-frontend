// utils/fileUtils.ts
export const getSingleFile = (e: React.ChangeEvent<HTMLInputElement>): File | null => {
    if (e.target.files && e.target.files[0]) {
        return e.target.files[0];
    }
    return null;
};
