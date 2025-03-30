import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import "./App.css"; // Import the CSS file

const GET_POSTS = gql`
  query {
    posts {
      id
      title
      content
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const POST_SUBSCRIPTION = gql`
  subscription {
    postAdded {
      id
      title
      content
    }
  }
`;

export default function PostTable() {
  const { loading, error, data } = useQuery(GET_POSTS);
  const [createPost] = useMutation(CREATE_POST);
  const { data: subData } = useSubscription(POST_SUBSCRIPTION);

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (data) {
      setPosts(data.posts);
    }
  }, [data]);

  useEffect(() => {
    if (subData) {
      setPosts((prev) => [...prev, subData.postAdded]);
    }
  }, [subData]);

  const handleCreatePost = async () => {
    const title = prompt("Enter post title:");
    const content = prompt("Enter post content:");
    if (title && content) {
      await createPost({ variables: { title, content } });
    }
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts</p>;

  return (
    <div className="table-container">
      <h2>Posts</h2>
      <button onClick={handleCreatePost}>Create New Post</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
