// pages/api/share/[link_id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { link_id } = req.query;
  try {
    // Call the backend shareable link download endpoint.
    // For example, if your backend exposes /api/files/shareable/<link_id>
    const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/files/shareable/${link_id}`, {
      responseType: 'stream',
    });
    
    // Pass through the relevant headers (such as content-disposition and content-type)
    res.setHeader('Content-Disposition', response.headers['content-disposition']);
    res.setHeader('Content-Type', response.headers['content-type']);
    
    // Pipe the backend response data directly to the client
    response.data.pipe(res);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Error downloading file' });
  }
}

