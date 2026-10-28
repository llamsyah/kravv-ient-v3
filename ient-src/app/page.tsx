import SignIn from './sign-in';
import Workspace from './workspace';
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();const local=process.env.NODE_ENV==='development'&&(await headers()).get('x-kravv-local-mode')==='1';if(!user&&local)redirect('/access');if(!user)return <SignIn signInHref={chatGPTSignInPath('/')}/>;return <Workspace/>}
