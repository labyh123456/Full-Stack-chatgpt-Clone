// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import admin from 'firebase-admin';
import query from '../../lib/queryApi';
import { adminDb } from '../../firebaseAdmin';

type Data = {
  answer: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    const { prompt, chatId, model, session } = req.body;

    if (!prompt) {
        res.status(400).json({ answer: "Please Provide a Prompt" })
        return;
    }

    if (!chatId) {
        res.status(400).json({ answer: "Please Provie a valid Chatid" });
        return;
    }

    // ChatGpt query

    const response = await query(prompt, chatId, model || 'text-davinci-003');
    // console.log('res', response);
    const message: Message = {
        text: response || "ChatGPT was unable to find an answer for that",
        createdAt: admin.firestore.Timestamp.now(),
        user: {
            _id: 'ChatGPT',
            name: 'ChatGPT',
            avator:'https://links.papareact.com/89k'
        }
    }

    await adminDb.collection('users').doc(session?.user?.email).collection("chats").doc(chatId).collection("messages").add(message)
    // console.log(message.text)
    res.status(200).json({ answer: message.text });
}
