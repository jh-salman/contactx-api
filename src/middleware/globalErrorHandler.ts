
import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Prevent sending response if headers already sent
    if (res.headersSent) {
        console.error("Error after response sent:", err);
        return next(err);
    }

    console.error(err.stack);
    
    const statuscode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statuscode).json({ 
        success: false,
        message
    });
}