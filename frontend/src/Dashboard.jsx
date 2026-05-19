import React from "react";
import { ThumbsUp } from "lucide-react";
import { API_BASE_URL } from "./api";

export default function Dashboard({ posts, setPosts, user }) {
  if (!user) {
    return <div style={{ color: '#00c6ff', textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }
  // Backend handlers
  const token = localStorage.getItem("token");

  // Like/Unlike post
  const handleLike = async (post) => {
    const currentUserId = user?._id;
    const alreadyLiked = post.likes.includes(currentUserId);
    const action = alreadyLiked ? "unlike" : "like";
    // Optimistically update UI only if not already sending request
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id !== post.id) return p;
      const newLikes = alreadyLiked
        ? p.likes.filter(uid => uid !== currentUserId)
        : [...p.likes, currentUserId];
      return {
        ...p,
        likes: newLikes
      };
    }));
    const url = `${API_BASE_URL}/posts/${post.id}/${action}`;
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to update like"))
      .then(() => {
        // Always refetch posts to get the latest likes array from backend
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(() => setPosts([]));
      })
      .catch(() => {});
  };

  // Add comment
  const handleComment = async (post, text) => {
    fetch(`${API_BASE_URL}/posts/${post.id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text })
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to add comment"))
      .then(() => {
        fetch("http://127.0.0.1:8000/posts", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => {
            const currentUserId = localStorage.getItem("user_id");
            const postsWithLiked = Array.isArray(data)
              ? data.map(post => ({
                  ...post,
                  liked: Array.isArray(post.likes) && post.likes.includes(currentUserId)
                }))
              : [];
            setPosts(postsWithLiked);
          })
          .catch(() => setPosts([]));
      });
  };

  // Delete comment
  const handleDeleteComment = async (post, commentId) => {
    fetch(`${API_BASE_URL}/posts/${post.id}/comment/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to delete comment"))
      .then(() => {
        fetch("http://127.0.0.1:8000/posts", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(() => setPosts([]));
      });
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          alert(`Delete post failed: ${errorText}`);
          throw new Error(errorText);
        }
        return res.json();
      })
      .then(() => {
        fetch("http://127.0.0.1:8000/posts", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(() => setPosts([]));
      })
      .catch(() => {});
  };

  return (
    <div
      className="posts-container"
      style={{
        position: "absolute",
        left: "180px",
        top: "60px",
        width: "calc(100% - 180px)",
        minHeight: "calc(100vh - 60px)",
        maxWidth: "calc(100% - 180px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        padding: "32px",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "auto",
        color: "#fff",
      }}
    >
      {posts.map((post) => (
        <div
          key={post?.id || Math.random()}
          className="post-card mb-4 p-4 bg-dark rounded shadow-sm d-flex flex-column"
          style={{
            maxWidth: "500px",
            minHeight: "350px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div className="d-flex align-items-center mb-2">
            <img
              src={user && post?.user_id === user._id ? (user.profilePic || "/default-profile.png") : (post?.user?.profilePic || "/default-profile.png")}
              alt="user"
              className="rounded-circle me-2"
              style={{ width: "40px", height: "40px" }}
            />
            <strong>{user && post?.user_id === user._id ? (user.name || "User") : (post?.user?.name || "User")}</strong>
          </div>
          <p style={{ minHeight: "80px", fontSize: "1.15rem" }}>{post?.content}</p>
          {post?.image && (
            <img
              src={post.image}
              alt="post"
              style={{ width: "100%", borderRadius: "6px", marginTop: "10px" }}
            />
          )}
          <div className="flex-grow-1" style={{ minHeight: "40px" }}></div>
          <div className="d-flex align-items-center gap-3 mt-auto pt-3" style={{ justifyContent: "flex-start", background: "inherit", zIndex: 2 }}>
            <button
              className={`d-flex align-items-center px-0 py-0 bg-transparent text-gray-400 hover:text-blue-400 transition-all duration-200${post?.likes?.includes(user._id) ? ' liked' : ''}`}
              style={{ boxShadow: "none", border: "none", background: "transparent", color: post?.likes?.includes(user._id) ? "#00c6ff" : "#888", fontWeight: 600, fontSize: "1.1rem", cursor: "pointer", outline: "none" }}
              onClick={() => handleLike(post)}
            >
              <svg width="24" height="24" fill="none" stroke={post?.likes?.includes(user._id) ? "#00c6ff" : "#888"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M5 15h14l-1.34 5.34A2 2 0 0 1 15.7 22H8.3a2 2 0 0 1-1.96-1.66L5 15z"/></svg>
              {Array.isArray(post?.likes) ? post.likes.length : 0}
            </button>
            <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
              <input
                type="text"
                placeholder="Add a comment..."
                className="comment-input form-control form-control-sm text-gray-900 border-0 rounded-lg"
                style={{ width: "100%", background: "#3a3f44", color: "#eee", paddingRight: "36px" }}
                value={post._commentInput || ""}
                onChange={e => {
                  post._commentInput = e.target.value;
                  setPosts([...posts]);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleComment(post, e.target.value);
                    post._commentInput = "";
                    setPosts([...posts]);
                  }
                }}
              />
              <button
                className="btn btn-sm"
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#00c6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                title="Send Comment"
                onClick={() => {
                  if (post._commentInput && post._commentInput.trim()) {
                    handleComment(post, post._commentInput);
                    post._commentInput = "";
                    setPosts([...posts]);
                  }
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00c6ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="mt-2">
              {post.comments.map((c, idx) => (
                <div key={idx} style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: "4px" }}>
                  <span style={{ color: "#00c6ff", fontWeight: "bold" }}>Comment:</span> {c.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}




